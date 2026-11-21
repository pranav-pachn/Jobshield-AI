import os
import math
from unittest.mock import patch, MagicMock
import pytest
import httpx

from services.rag_retrieval import (
    embed_query,
    embed_query_huggingface,
    embed_query_local,
    _validate_and_normalize_vector,
    _parse_hf_response
)
from services.scam_detection import initialize_models, get_model_status

def _make_dummy_vector(dim: int = 384, seed_val: float = 0.05) -> list:
    # Generates a dummy non-zero finite vector
    vec = [float((i % 17 + 1) * seed_val) for i in range(dim)]
    norm = math.sqrt(sum(x * x for x in vec))
    return [x / norm for x in vec]


def test_huggingface_embedding_success_1d():
    expected_vec = _make_dummy_vector(384)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = expected_vec

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        result = embed_query_huggingface("test query", token="dummy_hf_token")
        assert len(result) == 384
        assert all(isinstance(x, float) and math.isfinite(x) for x in result)
        assert abs(math.sqrt(sum(x * x for x in result)) - 1.0) < 1e-4
        assert mock_post.call_count == 1


def test_huggingface_embedding_success_2d_batch():
    expected_vec = _make_dummy_vector(384)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = [expected_vec]

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        result = embed_query_huggingface("test query", token="dummy_hf_token")
        assert len(result) == 384
        assert abs(math.sqrt(sum(x * x for x in result)) - 1.0) < 1e-4


def test_huggingface_embedding_token_level_mean_pooling():
    # Shape: 3 tokens, each with 384 dimensions
    token1 = [1.0] * 384
    token2 = [2.0] * 384
    token3 = [3.0] * 384
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = [token1, token2, token3]

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        result = embed_query_huggingface("test query", token="dummy_hf_token")
        assert len(result) == 384
        # Mean is 2.0 for all dimensions; normalized should be 1/sqrt(384)
        expected_val = 1.0 / math.sqrt(384)
        for x in result:
            assert abs(x - expected_val) < 1e-4
        assert abs(math.sqrt(sum(x * x for x in result)) - 1.0) < 1e-4


def test_huggingface_embedding_openai_format():
    expected_vec = _make_dummy_vector(384)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "object": "list",
        "data": [{"embedding": expected_vec, "index": 0}]
    }

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        result = embed_query_huggingface("test query", token="dummy_hf_token")
        assert len(result) == 384


def test_huggingface_missing_token_error(monkeypatch):
    monkeypatch.delenv("HF_TOKEN", raising=False)
    monkeypatch.delenv("HF_API_KEY", raising=False)
    monkeypatch.delenv("HF_API_TOKEN", raising=False)

    with pytest.raises(ValueError, match="neither HF_TOKEN nor HF_API_KEY"):
        embed_query_huggingface("test query", token=None)


def test_huggingface_auth_error_401_no_retry():
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.text = "Invalid or expired API token"

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        with pytest.raises(RuntimeError, match="authentication failed \\(HTTP 401\\)"):
            embed_query_huggingface("test query", token="invalid_token", max_retries=3)
        assert mock_post.call_count == 1  # Fast-fail, no retry on 401


def test_huggingface_auth_error_403_no_retry():
    mock_resp = MagicMock()
    mock_resp.status_code = 403
    mock_resp.text = "Forbidden"

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        with pytest.raises(RuntimeError, match="authentication failed \\(HTTP 403\\)"):
            embed_query_huggingface("test query", token="forbidden_token", max_retries=3)
        assert mock_post.call_count == 1


def test_huggingface_bad_request_400_no_retry():
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.text = "Bad Request: Empty input"

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        with pytest.raises(ValueError, match="bad request \\(HTTP 400\\)"):
            embed_query_huggingface("test query", token="dummy_hf_token", max_retries=3)
        assert mock_post.call_count == 1


def test_huggingface_rate_limit_429_retries_and_raises():
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.text = "Rate limit reached"
    mock_resp.json.return_value = {"error": "Rate limited"}

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        with patch("time.sleep", return_value=None):
            with pytest.raises(RuntimeError, match="HTTP 429"):
                embed_query_huggingface("test query", token="dummy_hf_token", max_retries=3)
            assert mock_post.call_count == 3


def test_huggingface_503_estimated_time_retries_and_succeeds():
    mock_503 = MagicMock()
    mock_503.status_code = 503
    mock_503.json.return_value = {"error": "Model loading", "estimated_time": 1.5}

    mock_200 = MagicMock()
    mock_200.status_code = 200
    mock_200.json.return_value = _make_dummy_vector(384)

    with patch.object(httpx.Client, "post", side_effect=[mock_503, mock_200]) as mock_post:
        with patch("time.sleep", return_value=None):
            result = embed_query_huggingface("test query", token="dummy_hf_token", max_retries=3)
            assert len(result) == 384
            assert mock_post.call_count == 2


def test_huggingface_network_timeout_retries_and_succeeds():
    mock_200 = MagicMock()
    mock_200.status_code = 200
    mock_200.json.return_value = _make_dummy_vector(384)

    req = httpx.Request("POST", "http://test")
    timeout_err = httpx.ReadTimeout("Read timed out", request=req)

    with patch.object(httpx.Client, "post", side_effect=[timeout_err, mock_200]) as mock_post:
        with patch("time.sleep", return_value=None):
            result = embed_query_huggingface("test query", token="dummy_hf_token", max_retries=3)
            assert len(result) == 384
            assert mock_post.call_count == 2


def test_huggingface_network_failure_exhausts_retries():
    req = httpx.Request("POST", "http://test")
    conn_err = httpx.ConnectError("Failed to connect", request=req)

    with patch.object(httpx.Client, "post", side_effect=conn_err) as mock_post:
        with patch("time.sleep", return_value=None):
            with pytest.raises(RuntimeError, match="network failure after 3 attempts"):
                embed_query_huggingface("test query", token="dummy_hf_token", max_retries=3)
            assert mock_post.call_count == 3


def test_rejects_wrong_dimensions():
    # 512 dimensions (e.g., from incompatible model)
    wrong_dim_vec = _make_dummy_vector(512)
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = wrong_dim_vec

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        with pytest.raises(ValueError, match="expected 384, got 512"):
            embed_query_huggingface("test query", token="dummy_hf_token")


def test_rejects_non_finite_values():
    vec_with_nan = [0.1] * 383 + [float("nan")]
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = vec_with_nan

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        with pytest.raises(ValueError, match="non-finite or non-numeric"):
            embed_query_huggingface("test query", token="dummy_hf_token")

    vec_with_inf = [0.1] * 383 + [float("inf")]
    mock_resp.json.return_value = vec_with_inf
    with patch.object(httpx.Client, "post", return_value=mock_resp):
        with pytest.raises(ValueError, match="non-finite or non-numeric"):
            embed_query_huggingface("test query", token="dummy_hf_token")


def test_rejects_zero_vector():
    zero_vec = [0.0] * 384
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = zero_vec

    with patch.object(httpx.Client, "post", return_value=mock_resp):
        with pytest.raises(ValueError, match="zero or non-finite L2 norm"):
            embed_query_huggingface("test query", token="dummy_hf_token")


def test_embed_query_provider_routing_huggingface(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "huggingface")
    monkeypatch.setenv("HF_TOKEN", "valid_mock_token")

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = _make_dummy_vector(384)

    with patch.object(httpx.Client, "post", return_value=mock_resp) as mock_post:
        res = embed_query("sample job text")
        assert len(res) == 384
        assert mock_post.call_count == 1


def test_embed_query_provider_routing_local(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "local")
    res = embed_query("sample job text")
    assert len(res) == 384
    assert abs(math.sqrt(sum(x * x for x in res)) - 1.0) < 1e-4


def test_embed_query_unsupported_provider(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "cohere_invalid")
    with pytest.raises(ValueError, match="Unsupported EMBEDDING_PROVIDER"):
        embed_query("sample job text")


def test_embed_query_local_missing_package_error():
    with patch.dict("sys.modules", {"sentence_transformers": None}):
        with patch("services.rag_retrieval._embed_model", None):
            with pytest.raises(RuntimeError, match="sentence-transformers.*not installed"):
                embed_query_local("test query")


def test_scam_detection_startup_remote_huggingface(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "huggingface")
    status = initialize_models()
    assert status.get("semantic") == "configured_remote"

    model_status = get_model_status()
    assert model_status["models_loaded"]["semantic"] is True
