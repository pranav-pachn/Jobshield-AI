const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");

function toPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }

  return `${Math.round(value * 100)}%`;
}

analyzeBtn.onclick = async () => {
  analyzeBtn.disabled = true;
  result.innerText = "Analyzing current page...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || typeof tab.id !== "number") {
      throw new Error("No active tab found.");
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_TEXT" });
    const pageText = response?.text?.trim();

    if (!pageText) {
      throw new Error("Could not extract text from this page.");
    }

    const res = await fetch("http://localhost:4000/api/jobs/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: pageText }),
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const data = await res.json();

    const riskScore =
      typeof data.finalScore === "number"
        ? `${Math.round(data.finalScore)}%`
        : typeof data.riskScore === "number"
          ? `${Math.round(data.riskScore)}%`
          : typeof data.analysis?.risk_score === "number"
            ? `${Math.round(data.analysis.risk_score)}%`
            : "N/A";

    const riskLevel = data.riskLevel || data.analysis?.risk_level || "Unknown";
    const confidence =
      typeof data.confidence === "number"
        ? toPercent(data.confidence)
        : typeof data.analysis?.confidence === "number"
          ? toPercent(data.analysis.confidence)
          : "N/A";

    result.innerText = `Risk: ${riskScore} (${riskLevel})\nConfidence: ${confidence}`;
  } catch (error) {
    result.innerText = `Analysis failed: ${error.message || "Unknown error"}`;
  } finally {
    analyzeBtn.disabled = false;
  }
};
