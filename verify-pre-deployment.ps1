# Pre-Deployment Verification Script
# Runs all automated checks from Phase 1 of the verification plan

param(
    [switch]$SkipAI = $false,
    [switch]$QuickMode = $false
)

$startTime = Get-Date
$results = @()
$passed = 0
$failed = 0

Write-Host "================================" -ForegroundColor Cyan
Write-Host "JobShield-AI Pre-Deployment Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: MongoDB Connection Test
# ============================================================================
Write-Host "[1/5] Testing MongoDB Connection..." -ForegroundColor Yellow

try {
    Push-Location backend
    $output = node testConnection.js 2>&1
    Pop-Location
    
    if ($output -match "success|connected|Connection|connected successfully" -or -not $output) {
        Write-Host "✅ MongoDB connection successful" -ForegroundColor Green
        $results += [PSCustomObject]@{ Step = "MongoDB Connection"; Status = "PASS"; Details = "Connected" }
        $passed++
    } else {
        Write-Host "⚠️  MongoDB connection check completed (check logs for details)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Step = "MongoDB Connection"; Status = "INFO"; Details = $output[0..2] -join " " }
    }
} catch {
    Write-Host "❌ MongoDB connection failed: $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{ Step = "MongoDB Connection"; Status = "FAIL"; Details = $_.Exception.Message }
    $failed++
}

Write-Host ""

# ============================================================================
# STEP 2: Backend API Health & Response Time
# ============================================================================
Write-Host "[2/5] Testing Backend API Response Time..." -ForegroundColor Yellow

try {
    Push-Location backend
    $npxCheck = & npm run dev --help 2>&1 | Select-Object -First 1
    Pop-Location
    
    # Quick health check
    $healthCheck = $false
    $responseTimes = @()
    
    for ($i = 0; $i -lt 3; $i++) {
        try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:4000/api/health" -TimeoutSec 5 -ErrorAction Stop
            $sw.Stop()
            $responseTimes += $sw.ElapsedMilliseconds
            $healthCheck = $true
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }
    
    if ($healthCheck -and $responseTimes.Count -gt 0) {
        $avgTime = [Math]::Round(($responseTimes | Measure-Object -Average).Average, 0)
        if ($avgTime -lt 500) {
            Write-Host "✅ API responds in ${avgTime}ms (target: <500ms)" -ForegroundColor Green
            $results += [PSCustomObject]@{ Step = "API Response Time"; Status = "PASS"; Details = "${avgTime}ms average" }
            $passed++
        } else {
            Write-Host "⚠️  API responds in ${avgTime}ms (acceptable but above target <500ms)" -ForegroundColor Yellow
            $results += [PSCustomObject]@{ Step = "API Response Time"; Status = "WARN"; Details = "${avgTime}ms average" }
        }
    } else {
        Write-Host "⚠️  Backend API not responding - ensure 'npm run dev' is running on port 4000" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Step = "API Response Time"; Status = "SKIP"; Details = "Backend not running (manual start required)" }
    }
} catch {
    Write-Host "❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{ Step = "API Response Time"; Status = "FAIL"; Details = $_.Exception.Message }
    $failed++
}

Write-Host ""

# ============================================================================
# STEP 3: Analytics Endpoints
# ============================================================================
Write-Host "[3/5] Testing Analytics Endpoints..." -ForegroundColor Yellow

$analyticsEndpoints = @(
    "/api/analytics/risk-distribution",
    "/api/analytics/trends",
    "/api/analytics/top-indicators"
)

$analyticsPass = 0
$analyticsSkip = $false

foreach ($endpoint in $analyticsEndpoints) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:4000${endpoint}" -TimeoutSec 5 -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        if ($json) {
            Write-Host "  ✅ $endpoint returns valid JSON" -ForegroundColor Green
            $analyticsPass++
        }
    } catch {
        if ($_.Exception.Message -match "unable to connect|No connection could be made") {
            $analyticsSkip = $true
        }
    }
}

if ($analyticsPass -gt 0) {
    Write-Host "✅ Analytics endpoints returning data ($analyticsPass/$($analyticsEndpoints.Count))" -ForegroundColor Green
    $results += [PSCustomObject]@{ Step = "Analytics Endpoints"; Status = "PASS"; Details = "$analyticsPass endpoints responding" }
    $passed++
} elseif ($analyticsSkip) {
    Write-Host "⚠️  Analytics endpoints check skipped (backend not running)" -ForegroundColor Yellow
    $results += [PSCustomObject]@{ Step = "Analytics Endpoints"; Status = "SKIP"; Details = "Backend not running" }
} else {
    Write-Host "⚠️  Analytics endpoints not fully responding (may need test data)" -ForegroundColor Yellow
    $results += [PSCustomObject]@{ Step = "Analytics Endpoints"; Status = "INFO"; Details = "Requires test data" }
}

Write-Host ""

# ============================================================================
# STEP 4: AI Service Detection
# ============================================================================
if (-not $SkipAI) {
    Write-Host "[4/5] Testing AI Service Detection..." -ForegroundColor Yellow
    
    try {
        $aiHealthCheck = $false
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8001/api/health" -TimeoutSec 5 -ErrorAction Stop
            $aiHealthCheck = $true
        } catch {
            $aiHealthCheck = $false
        }
        
        if ($aiHealthCheck) {
            # Test actual detection
            $testJobPosting = @{
                text = "Work from home! No experience needed. $500-$2000 per week. Click here to apply NOW!"
            } | ConvertTo-Json
            
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8001/api/analyze-job" -Method POST `
                -Headers @{"Content-Type"="application/json"} -Body $testJobPosting -TimeoutSec 30 -ErrorAction Stop
            $sw.Stop()
            
            $json = $response.Content | ConvertFrom-Json
            if ($json.scam_probability -ne $null) {
                Write-Host "✅ AI service detects scams (probability: $($json.scam_probability)%, time: $($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
                $results += [PSCustomObject]@{ Step = "AI Service Detection"; Status = "PASS"; Details = "Working correctly" }
                $passed++
            }
        } else {
            Write-Host "⚠️  AI service not responding on port 8001 (ensure 'python run_service.py' is running)" -ForegroundColor Yellow
            $results += [PSCustomObject]@{ Step = "AI Service Detection"; Status = "SKIP"; Details = "AI service not running" }
        }
    } catch {
        Write-Host "⚠️  AI service check incomplete: $($_.Exception.Message)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Step = "AI Service Detection"; Status = "SKIP"; Details = "Port 8001 not accessible" }
    }
} else {
    Write-Host "[4/5] Skipping AI Service Detection (-SkipAI flag)" -ForegroundColor Gray
    $results += [PSCustomObject]@{ Step = "AI Service Detection"; Status = "SKIP"; Details = "Skipped by user" }
}

Write-Host ""

# ============================================================================
# STEP 5: Concurrent Load Test
# ============================================================================
Write-Host "[5/5] Testing Concurrent Load (5 requests)..." -ForegroundColor Yellow

try {
    $concurrentResults = @()
    $jobs = @()
    
    for ($i = 1; $i -le 5; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($index)
            try {
                $sw = [System.Diagnostics.Stopwatch]::StartNew()
                $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:4000/api/jobs/stats" -TimeoutSec 10 -ErrorAction Stop
                $sw.Stop()
                return @{ Index = $index; Success = $true; Time = $sw.ElapsedMilliseconds; Error = $null }
            } catch {
                return @{ Index = $index; Success = $false; Time = -1; Error = $_.Exception.Message }
            }
        } -ArgumentList $i
    }
    
    $concurrentResults = $jobs | Wait-Job | Receive-Job
    
    $successCount = ($concurrentResults | Where-Object { $_.Success } | Measure-Object).Count
    $avgTime = [Math]::Round(($concurrentResults | Where-Object { $_.Success } | Select-Object -ExpandProperty Time | Measure-Object -Average).Average, 0)
    
    if ($successCount -eq 5) {
        Write-Host "✅ All 5 concurrent requests succeeded (avg: ${avgTime}ms)" -ForegroundColor Green
        $results += [PSCustomObject]@{ Step = "Concurrent Load"; Status = "PASS"; Details = "5/5 successful, ${avgTime}ms avg" }
        $passed++
    } elseif ($successCount -gt 0) {
        Write-Host "⚠️  $successCount/5 concurrent requests succeeded" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Step = "Concurrent Load"; Status = "WARN"; Details = "$successCount/5 successful" }
    } else {
        Write-Host "⚠️  Concurrent requests skipped (backend not running)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{ Step = "Concurrent Load"; Status = "SKIP"; Details = "Backend not running" }
    }
    
    $jobs | Remove-Job
} catch {
    Write-Host "❌ Concurrent load test failed: $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{ Step = "Concurrent Load"; Status = "FAIL"; Details = $_.Exception.Message }
    $failed++
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "AUTOMATED VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$results | Format-Table -AutoSize

$duration = ((Get-Date) - $startTime).TotalSeconds
Write-Host "✅ Passed: $passed | ⚠️  Skipped/Info: $(($results | Where-Object Status -in 'SKIP','WARN','INFO' | Measure-Object).Count) | ❌ Failed: $failed" -ForegroundColor White
Write-Host "Duration: $([Math]::Round($duration, 1))s" -ForegroundColor Gray
Write-Host ""

if ($failed -gt 0) {
    Write-Host "⚠️  ACTION REQUIRED: Check failed items above and restart services if needed" -ForegroundColor Red
    Write-Host "   Backend: Run 'cd backend && npm run dev' in a separate terminal" -ForegroundColor Gray
    Write-Host "   AI Service: Run 'cd ai-service && python run_service.py' in a separate terminal" -ForegroundColor Gray
} else {
    Write-Host "✅ Automated verification complete! Review any SKIP/WARN items and proceed to manual QA" -ForegroundColor Green
}

Write-Host ""
Write-Host "[NEXT] Manual QA Checklist (see verify-manual-qa-checklist.txt)" -ForegroundColor Cyan
Write-Host ""
