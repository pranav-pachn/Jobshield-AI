param(
    [string]$ApiUrl = "http://localhost:4000/api/jobs/analyze",
    [string]$HealthUrl = "http://localhost:4000/api/health",
    [string]$DatasetPath = "datasets/job_scams.json",
    [string]$Indices = "0,7,22,55,70",
    [double]$ScamThreshold = 0.6,
    [switch]$AllDataset,
    [switch]$SweepThresholds,
    [double]$MinThreshold = 0.1,
    [double]$MaxThreshold = 0.9,
    [double]$ThresholdStep = 0.05,
    [switch]$NoFailOnMismatch
)

$ErrorActionPreference = "Stop"

function Parse-Indices {
    param([string]$raw)

    $values = @()
    foreach ($part in ($raw -split ",")) {
        $trimmed = $part.Trim()
        if (-not $trimmed) {
            continue
        }
        $parsed = 0
        if ([int]::TryParse($trimmed, [ref]$parsed)) {
            $values += $parsed
        }
    }

    if ($values.Count -eq 0) {
        throw "No valid indices were provided. Example: 0,7,22,55,70"
    }

    return $values
}

function Get-Metrics {
    param(
        [object[]]$rows,
        [double]$threshold
    )

    $tp = 0
    $tn = 0
    $fp = 0
    $fn = 0

    foreach ($row in $rows) {
        $predicted = if ($row.ProbabilityRaw -ge $threshold -or $row.Risk -eq "High") { "scam" } else { "legit" }

        if ($row.Expected -eq "scam" -and $predicted -eq "scam") { $tp++ }
        elseif ($row.Expected -eq "legit" -and $predicted -eq "legit") { $tn++ }
        elseif ($row.Expected -eq "legit" -and $predicted -eq "scam") { $fp++ }
        elseif ($row.Expected -eq "scam" -and $predicted -eq "legit") { $fn++ }
    }

    $precision = if (($tp + $fp) -gt 0) { [double]$tp / ($tp + $fp) } else { 0.0 }
    $recall = if (($tp + $fn) -gt 0) { [double]$tp / ($tp + $fn) } else { 0.0 }
    $f1 = if (($precision + $recall) -gt 0) { 2.0 * $precision * $recall / ($precision + $recall) } else { 0.0 }
    $accuracy = if ($rows.Count -gt 0) { [double]($tp + $tn) / $rows.Count } else { 0.0 }

    [PSCustomObject]@{
        Threshold = [math]::Round($threshold, 2)
        TP = $tp
        TN = $tn
        FP = $fp
        FN = $fn
        Precision = $precision
        Recall = $recall
        F1 = $f1
        Accuracy = $accuracy
        Passed = $tp + $tn
        Failed = $fp + $fn
        Total = $rows.Count
    }
}

try {
    $health = Invoke-RestMethod -Uri $HealthUrl -Method Get
    Write-Host "Health check:" ($health | ConvertTo-Json -Depth 5)
} catch {
    Write-Error "Backend health check failed at $HealthUrl. $_"
    exit 1
}

if (-not (Test-Path $DatasetPath)) {
    Write-Error "Dataset file not found: $DatasetPath"
    exit 1
}

$data = Get-Content -Raw -Path $DatasetPath | ConvertFrom-Json
$selected = if ($AllDataset) {
    0..($data.Count - 1)
} else {
    Parse-Indices -raw $Indices
}

$results = @()
foreach ($index in $selected) {
    if ($index -lt 0 -or $index -ge $data.Count) {
        Write-Warning "Skipping out-of-range index: $index"
        continue
    }

    $item = $data[$index]
    $body = @{ text = [string]$item.text } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -ContentType "application/json" -Body $body

    $probabilityRaw = [double]$response.scam_probability
    $probability = [math]::Round($probabilityRaw, 2)
    $risk = [string]$response.risk_level
    $expected = [string]$item.label
    $predicted = if ($probabilityRaw -ge $ScamThreshold -or $risk -eq "High") { "scam" } else { "legit" }
    $isPass = $predicted -eq $expected

    $results += [PSCustomObject]@{
        Index = $index
        Expected = $expected
        Predicted = $predicted
        Probability = [math]::Round($probability, 2)
        ProbabilityRaw = $probabilityRaw
        Risk = $risk
        Pass = $isPass
        SuspiciousPhrases = (($response.suspicious_phrases | ForEach-Object { [string]$_ }) -join "; ")
    }
}

if ($results.Count -eq 0) {
    Write-Error "No valid test rows were executed."
    exit 1
}

$results | Select-Object Index, Expected, Predicted, Probability, Risk, Pass, SuspiciousPhrases | Format-Table -AutoSize

$passCount = ($results | Where-Object { $_.Pass }).Count
$failCount = $results.Count - $passCount

$metrics = Get-Metrics -rows $results -threshold $ScamThreshold

Write-Host ""
Write-Host "Summary:"
Write-Host "Passed: $passCount / $($results.Count)"
Write-Host "Failed: $failCount"
Write-Host ""
Write-Host "Metrics:"
Write-Host ("Threshold: {0:N2}" -f $ScamThreshold)
Write-Host "TP: $($metrics.TP)  FP: $($metrics.FP)"
Write-Host "FN: $($metrics.FN)  TN: $($metrics.TN)"
Write-Host ("Precision: {0:N4}" -f $metrics.Precision)
Write-Host ("Recall:    {0:N4}" -f $metrics.Recall)
Write-Host ("F1 Score:  {0:N4}" -f $metrics.F1)
Write-Host ("Accuracy:  {0:N4}" -f $metrics.Accuracy)

if ($SweepThresholds) {
    if ($ThresholdStep -le 0) {
        Write-Error "ThresholdStep must be > 0"
        exit 1
    }
    if ($MinThreshold -gt $MaxThreshold) {
        Write-Error "MinThreshold must be <= MaxThreshold"
        exit 1
    }

    $sweepRows = @()
    $t = $MinThreshold
    while ($t -le ($MaxThreshold + 0.000001)) {
        $sweepRows += Get-Metrics -rows $results -threshold $t
        $t = [math]::Round($t + $ThresholdStep, 6)
    }

    $best = $sweepRows |
        Sort-Object -Property @{Expression = 'F1'; Descending = $true }, @{Expression = 'Recall'; Descending = $true }, @{Expression = 'Accuracy'; Descending = $true }, @{Expression = 'Threshold'; Descending = $false } |
        Select-Object -First 1

    Write-Host ""
    Write-Host "Threshold Sweep (by F1):"
    $sweepRows |
        Select-Object Threshold, Passed, Failed,
            @{Name = 'Precision'; Expression = { [math]::Round($_.Precision, 4) } },
            @{Name = 'Recall'; Expression = { [math]::Round($_.Recall, 4) } },
            @{Name = 'F1'; Expression = { [math]::Round($_.F1, 4) } },
            @{Name = 'Accuracy'; Expression = { [math]::Round($_.Accuracy, 4) } } |
        Format-Table -AutoSize

    Write-Host ""
    Write-Host "Best threshold recommendation:"
    Write-Host ("Threshold: {0:N2}" -f $best.Threshold)
    Write-Host ("Precision: {0:N4}  Recall: {1:N4}  F1: {2:N4}  Accuracy: {3:N4}" -f $best.Precision, $best.Recall, $best.F1, $best.Accuracy)
}

if ($failCount -gt 0 -and -not $NoFailOnMismatch -and -not $SweepThresholds) {
    exit 2
}

exit 0
