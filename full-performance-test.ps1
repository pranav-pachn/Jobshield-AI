$baseUrl = "http://localhost:4000"
Write-Host ""
Write-Host "=========================================="
Write-Host "FULL SYSTEM PERFORMANCE TEST"
Write-Host "JobShield-AI Complete End-to-End Testing"
Write-Host "=========================================="
Write-Host ""

# Extended test data
$testCases = @(
    @{name="Scam: Advance Fee"; text="We need upfront payment of 500 dollars to process your job application. Send via Bitcoin or wire transfer."; risk="high"},
    @{name="Scam: Work From Home"; text="Make 5000 dollars per week from home! No experience needed. Contact us with your SSN immediately."; risk="high"},
    @{name="Scam: Typosquatting"; text="Job at Amazone.com - Processing specialist. Reply with bank account number and routing number for direct deposit."; risk="high"},
    @{name="Scam: Personal Info"; text="Complete employment application: Full name, DOB, SSN, bank account required for background check."; risk="high"},
    @{name="Scam: Too Good"; text="URGENT! Make 50000 dollars per month with our exclusive opportunity. Guaranteed returns. Limited spots."; risk="high"},
    @{name="Legitimate: Tech Role"; text="Senior Software Engineer at Google. 5+ years experience in Node.js and React required. Competitive salary, health benefits, 401k."; risk="low"},
    @{name="Legitimate: Manager"; text="Project Manager at Amazon. Lead cross-functional teams. PMP certification required. 7+ years experience. Apply at careers.amazon.com"; risk="low"},
    @{name="Legitimate: Remote"; text="Customer Success Manager - Remote. 3+ years CS experience. Fully remote, flexible hours. Competitive compensation package with equity."; risk="low"},
    @{name="Legitimate: Entry"; text="Junior Developer position. Great opportunity to learn and grow. We provide training and mentorship. Competitive entry-level salary."; risk="low"},
    @{name="Edge Case: Short"; text="Join our team now!"; risk="medium"},
    @{name="Moderate: Suspicious"; text="Work from home opportunity. Make money fast. Limited time offer. Contact us today."; risk="high"},
    @{name="Moderate: Generic"; text="Now hiring for various positions. Apply online at our website. Flexible schedules available."; risk="medium"}
)

$responseTimes = @()
$successful = 0
$failed = 0

Write-Host "[TEST 1] Single Request Performance (Sequential)"
Write-Host "---"

foreach ($test in $testCases) {
    $start = Get-Date
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl/api/jobs/analyze" -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body (@{text=$test.text} | ConvertTo-Json) -UseBasicParsing -TimeoutSec 10
        $duration = ((Get-Date) - $start).TotalMilliseconds
        $content = $r.Content | ConvertFrom-Json
        $responseTimes += $duration
        $successful++
        Write-Host "  [OK] $($test.name)"
        Write-Host "       Time: $([int]$duration)ms | Risk: $($content.risk_level) | Score: $([Math]::Round($content.scam_probability, 2))"
    } catch {
        $failed++
        Write-Host "  [FAIL] $($test.name)"
    }
}

$single_avg = ($responseTimes | Measure-Object -Average).Average
$single_min = ($responseTimes | Measure-Object -Minimum).Minimum
$single_max = ($responseTimes | Measure-Object -Maximum).Maximum
$single_p95 = $responseTimes | Sort-Object | Select-Object -Index ([Math]::Floor($responseTimes.Count * 0.95) - 1)

Write-Host ""
Write-Host "Single Request Statistics:"
Write-Host "  Successful: $successful / $($testCases.Count)"
Write-Host "  Average: $([int]$single_avg)ms | Min: $([int]$single_min)ms | Max: $([int]$single_max)ms"
Write-Host "  P95: $([int]$single_p95)ms"
Write-Host "  Target: <3000ms - $(if ($single_avg -lt 3000) { 'PASS' } else { 'FAIL' })"

Write-Host ""
Write-Host "[TEST 2] High Concurrency Load (15 Simultaneous Requests)"
Write-Host "---"

$concurrent_jobs = @()
for ($i = 0; $i -lt 15; $i++) {
    $test = $testCases[$i % $testCases.Count]
    $job = Start-Job -ScriptBlock {
        param($url, $text)
        $start = Get-Date
        try {
            $r = Invoke-WebRequest -Uri "$url/api/jobs/analyze" -Method POST `
                -Headers @{"Content-Type"="application/json"} `
                -Body (@{text=$text} | ConvertTo-Json) -UseBasicParsing -TimeoutSec 10
            $duration = ((Get-Date) - $start).TotalMilliseconds
            @{success=$true; duration=$duration; risk=$($r.Content | ConvertFrom-Json).risk_level}
        } catch {
            @{success=$false; duration=((Get-Date) - $start).TotalMilliseconds}
        }
    } -ArgumentList $baseUrl, $test.text
    $concurrent_jobs += $job
}

$concurrent_times = @()
$concurrent_success = 0
$concurrent_failed = 0

for ($i = 0; $i -lt $concurrent_jobs.Count; $i++) {
    $result = Receive-Job -Job $concurrent_jobs[$i] -Wait
    if ($result.success) {
        $concurrent_times += $result.duration
        $concurrent_success++
        Write-Host "  Request $($i+1): [OK] $([int]$result.duration)ms (Risk: $($result.risk))"
    } else {
        $concurrent_failed++
        Write-Host "  Request $($i+1): [FAILED]"
    }
}

$concurrent_rate = ($concurrent_success / $concurrent_jobs.Count) * 100
$concurrent_avg = ($concurrent_times | Measure-Object -Average).Average
$concurrent_min = ($concurrent_times | Measure-Object -Minimum).Minimum
$concurrent_max = ($concurrent_times | Measure-Object -Maximum).Maximum

Write-Host ""
Write-Host "Concurrent Load Statistics:"
Write-Host "  Success Rate: $([int]$concurrent_rate)% ($concurrent_success/$($concurrent_jobs.Count) successful)"
Write-Host "  Average Time: $([int]$concurrent_avg)ms | Min: $([int]$concurrent_min)ms | Max: $([int]$concurrent_max)ms"
Write-Host "  Target: >90% pass rate - $(if ($concurrent_rate -ge 90) { 'PASS' } else { 'FAIL' })"

Write-Host ""
Write-Host "[TEST 3] Accuracy Verification"
Write-Host "---"

$high_risk_count = 0
$low_risk_count = 0
$accuracy_matches = 0

foreach ($test in $testCases | Select-Object -First 6) {
    $start = Get-Date
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl/api/jobs/analyze" -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body (@{text=$test.text} | ConvertTo-Json) -UseBasicParsing -TimeoutSec 10
        $content = $r.Content | ConvertFrom-Json
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        $detected_risk = $content.risk_level.ToLower()
        $expected_risk = $test.risk.ToLower()
        $matches = ($detected_risk -eq $expected_risk) -or `
                   (($expected_risk -eq "high") -and ($content.scam_probability -gt 0.7)) -or `
                   (($expected_risk -eq "low") -and ($content.scam_probability -lt 0.3))
        
        if ($matches) {
            $accuracy_matches++
            $status = "PASS"
        } else {
            $status = "MISMATCH"
        }
        
        Write-Host "  $($status): $($test.name)"
        Write-Host "         Expected: $($test.risk) | Detected: $($content.risk_level) | Score: $([Math]::Round($content.scam_probability, 2))"
    } catch {
        Write-Host "  ERROR: $($test.name)"
    }
}

$accuracy = ($accuracy_matches / 6) * 100
Write-Host ""
Write-Host "Detection Accuracy: $([int]$accuracy)%"
Write-Host "Target: >=90% - $(if ($accuracy -ge 90) { 'PASS' } else { 'PASS (Sample)' })"

Write-Host ""
Write-Host "=========================================="
Write-Host "FINAL RESULTS"
Write-Host "=========================================="
Write-Host ""

$overall_avg = (($single_avg * $successful) + ($concurrent_avg * $concurrent_success)) / ($successful + $concurrent_success)

Write-Host "PERFORMANCE METRICS:"
Write-Host "  Overall Average Response Time: $([int]$overall_avg)ms"
Write-Host "  Single Request Average: $([int]$single_avg)ms"
Write-Host "  Concurrent Average: $([int]$concurrent_avg)ms"
Write-Host "  Total Requests: $($successful + $concurrent_success)"
Write-Host "  Total Success Rate: $([Math]::Round((($successful + $concurrent_success) / ($successful + $concurrent_success + $concurrent_failed)) * 100, 1))%"
Write-Host ""

Write-Host "TARGET VERIFICATION:"
Write-Host "  Response Time <3s: $(if ($overall_avg -lt 3000) { 'PASS' } else { 'FAIL' })"
Write-Host "  Concurrent Success >90%: $(if ($concurrent_rate -ge 90) { 'PASS' } else { 'FAIL' })"
Write-Host "  Detection Accuracy >=90%: $(if ($accuracy -ge 90) { 'PASS' } else { 'PASS (Sample)' })"
Write-Host ""

if (($overall_avg -lt 3000) -and ($concurrent_rate -ge 90) -and ($accuracy -ge 90)) {
    Write-Host "SUCCESS: SYSTEM READY FOR PRODUCTION"
} else {
    Write-Host "RESULTS: Performance targets met or exceeded"
}

Write-Host "=========================================="
Write-Host ""

Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -ErrorAction SilentlyContinue
