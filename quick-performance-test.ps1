$baseUrl = "http://localhost:4000"
Write-Host ""
Write-Host "=========================================="
Write-Host "PERFORMANCE TEST: Initial Verification"
Write-Host "=========================================="

$testCases = @(
    @{name="Scam: Advance Fee"; text="We need upfront payment of 500 to process your job application."; risk="high"},
    @{name="Legitimate: Google"; text="Senior Engineer at Google. 5+ years experience. Competitive salary."; risk="low"},
    @{name="Scam: Work From Home"; text="Make 5000 dollars a week from home! No experience needed."; risk="high"},
    @{name="Legitimate: Amazon"; text="Project Manager at Amazon. Apply at careers.amazon.com"; risk="low"},
    @{name="Scam: Personal Info"; text="Enter your SSN and bank account for background check."; risk="high"}
)

$responseTimes = @()
$successful = 0
$failed = 0

Write-Host ""
Write-Host "[TEST 1] Single Requests"
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
        Write-Host "  OK: $($test.name) - $([int]$duration)ms - Risk: $($content.risk_level)"
    } catch {
        $failed++
        Write-Host "  FAIL: $($test.name)"
    }
}

$avg = ($responseTimes | Measure-Object -Average).Average
Write-Host ""
Write-Host "Single Request Results:"
Write-Host "  Successful: $successful / Total: $($testCases.Count)"
Write-Host "  Average Time: $([int]$avg)ms"
Write-Host "  Target: <3000ms - $(if ($avg -lt 3000) { 'PASS' } else { 'FAIL' })"

Write-Host ""
Write-Host "[TEST 2] Concurrent Load (5 requests)"
Write-Host "---"

$jobs = @()
for ($i = 0; $i -lt 5; $i++) {
    $test = $testCases[$i % $testCases.Count]
    $job = Start-Job -ScriptBlock {
        param($url, $text)
        $start = Get-Date
        try {
            $r = Invoke-WebRequest -Uri "$url/api/jobs/analyze" -Method POST `
                -Headers @{"Content-Type"="application/json"} `
                -Body (@{text=$text} | ConvertTo-Json) -UseBasicParsing -TimeoutSec 10
            $duration = ((Get-Date) - $start).TotalMilliseconds
            @{success=$true; duration=$duration}
        } catch {
            @{success=$false; duration=((Get-Date) - $start).TotalMilliseconds}
        }
    } -ArgumentList $baseUrl, $test.text
    $jobs += $job
}

$concurrent_times = @()
$concurrent_success = 0
for ($i = 0; $i -lt $jobs.Count; $i++) {
    $result = Receive-Job -Job $jobs[$i] -Wait
    if ($result.success) {
        $concurrent_times += $result.duration
        $concurrent_success++
        Write-Host "  Request $($i+1): $([int]$result.duration)ms (OK)"
    } else {
        Write-Host "  Request $($i+1): FAILED"
    }
}

$concurrent_rate = ($concurrent_success / $jobs.Count) * 100
$concurrent_avg = ($concurrent_times | Measure-Object -Average).Average

Write-Host ""
Write-Host "Concurrent Results:"
Write-Host "  Success Rate: $([int]$concurrent_rate)%"
Write-Host "  Average Time: $([int]$concurrent_avg)ms"
Write-Host "  Target: >90% success rate - $(if ($concurrent_rate -ge 90) { 'PASS' } else { 'FAIL' })"

Write-Host ""
Write-Host "=========================================="
if (($avg -lt 3000) -and ($concurrent_rate -ge 90)) {
    Write-Host "SUCCESS: Performance targets met"
} else {
    Write-Host "ATTENTION: Some targets not met"
}
Write-Host "=========================================="
Write-Host ""

Get-Job | Stop-Job
Get-Job | Remove-Job
