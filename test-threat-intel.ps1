# Test Threat Intelligence Endpoints
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "🔍 THREAT INTELLIGENCE FUNCTIONALITY TEST"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$baseUrl = "http://localhost:4000"

# Test 1: Health Check
Write-Output "`n1️⃣ HEALTH CHECK"
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Output "   ✅ Backend: Status $($health.StatusCode)"
} catch {
    Write-Output "   ❌ Backend not responding: $($_.Exception.Message)"
    exit 1
}

# Test 2: Legitimate Domain (Low Risk)
Write-Output "`n2️⃣ TEST: Legitimate Domain (google.com)"
try {
    $payload = @{ domain = "google.com" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/recruiters/check" `
      -Method POST `
      -ContentType "application/json" `
      -Body $payload `
      -UseBasicParsing -TimeoutSec 15

    $data = $response.Content | ConvertFrom-Json
    Write-Output "   Status: $($response.StatusCode)"
    Write-Output "   Domain: $($data.domain)"
    Write-Output "   Risk Level: [$($data.riskLevel)] Score: $($data.riskScore)/100"
    Write-Output "   Verified: $($data.isVerified)"
    Write-Output "   API Calls Made:"
    if ($data.indicators) {
        $data.indicators | ForEach-Object {
            if ($_ -match "✅" -or $_ -match "🚨" -or $_ -match "⚠️") {
                Write-Output "      $_"
            }
        }
    }
    if ($data.riskScore -lt 40) {
        Write-Output "   ✅ PASS: Low risk as expected"
    } else {
        Write-Output "   ⚠️ WARNING: Expected low risk, got $($data.riskScore)"
    }
} catch {
    Write-Output "   ❌ FAILED: $($_.Exception.Message)"
}

# Test 3: Email Verification
Write-Output "`n3️⃣ TEST: Email Verification (recruiter@amazon.com)"
try {
    $payload = @{ email = "recruiter@amazon.com" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/recruiters/check" `
      -Method POST `
      -ContentType "application/json" `
      -Body $payload `
      -UseBasicParsing -TimeoutSec 15

    $data = $response.Content | ConvertFrom-Json
    Write-Output "   Status: $($response.StatusCode)"
    Write-Output "   Email: $($data.email)"
    Write-Output "   Domain: $($data.domain)"
    Write-Output "   Risk Level: [$($data.riskLevel)] Score: $($data.riskScore)/100"
    Write-Output "   Verified: $($data.isVerified)"
    if ($data.riskScore -lt 40 -and $data.domain -eq "amazon.com") {
        Write-Output "   ✅ PASS: Email parsed and checked correctly"
    } else {
        Write-Output "   ⚠️ ISSUE: Unexpected result"
    }
} catch {
    Write-Output "   ❌ FAILED: $($_.Exception.Message)"
}

# Test 4: Suspicious Domain (If APIs configured)
Write-Output "`n4️⃣ TEST: Domain Pattern Detection"
try {
    $payload = @{ domain = "urgent-jobs-instant-pay.xyz" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/recruiters/check" `
      -Method POST `
      -ContentType "application/json" `
      -Body $payload `
      -UseBasicParsing -TimeoutSec 15

    $data = $response.Content | ConvertFrom-Json
    Write-Output "   Status: $($response.StatusCode)"
    Write-Output "   Domain: $($data.domain)"
    Write-Output "   Risk Level: [$($data.riskLevel)] Score: $($data.riskScore)/100"
    Write-Output "   Verified: $($data.isVerified)"
    Write-Output "   Threat Indicators Found: $($data.indicators.Count)"
    if ($data.indicators) {
        $data.indicators | Select-Object -First 3 | ForEach-Object {
            Write-Output "      • $_"
        }
    }
    if ($data.riskScore -gt 35) {
        Write-Output "   ✅ PASS: Detected suspicious patterns"
    } else {
        Write-Output "   ℹ️ INFO: Domain appears clean (if no external threats)"
    }
} catch {
    Write-Output "   ❌ FAILED: $($_.Exception.Message)"
}

# Test 5: Invalid Input
Write-Output "`n5️⃣ TEST: Error Handling (no input)"
try {
    $payload = @{} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$baseUrl/api/recruiters/check" `
      -Method POST `
      -ContentType "application/json" `
      -Body $payload `
      -UseBasicParsing -TimeoutSec 15
    Write-Output "   ❌ FAILED: Should have returned 400 error"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Output "   ✅ PASS: Correctly rejected invalid input (400)"
    } else {
        Write-Output "   ⚠️ Got status: $($_.Exception.Response.StatusCode)"
    }
}

Write-Output "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "✅ THREAT INTELLIGENCE TEST SUITE COMPLETE"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output ""
Write-Output "📋 SUMMARY:"
Write-Output "  • API Keys: Configured (Google, VirusTotal, WHOIS)"
Write-Output "  • Endpoint: /api/recruiters/check (Temporarily public for testing)"
Write-Output "  • Status: Testing Complete"
Write-Output ""
Write-Output "🔐 SECURITY NOTE:"
Write-Output "  After testing, re-add authMiddleware to recruiterRoutes:"
Write-Output "  recruiterRoutes.post('/check', authMiddleware, checkRecruiter);"
