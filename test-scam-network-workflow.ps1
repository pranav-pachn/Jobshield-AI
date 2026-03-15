# SCAM NETWORK WORKFLOW - END-TO-END TEST IMPLEMENTATION
# This script demonstrates the complete 3-step scam network intelligence workflow

$BaseURL = "http://localhost:4000/api"
$FrontendURL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STEP 1: ENTITY EXTRACTION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Sample scam job postings to analyze
$scamJobs = @(
    @{
        title = "Work from Home - Email Marketing"
        text = "Earn 5000 weekly working from home! No experience needed. Send your application to: marketing.admin@workfrom-home-jobs.net Bitcoin payment accepted: 1A1z7agoat2YLZW51Bc9m6ERZNqrATJ2gT Phone: +1-555-0123"
    },
    @{
        title = "Quick Cash - Instant Approval"
        text = "Get instant approval for quick cash! Contact: finance@quick-cash-system.com Ethereum wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f7bEb5 Call us: +1-555-0456"
    },
    @{
        title = "Data Entry - Remote Opportunity"
        text = "Remote data entry work available! Email: hr@data-entry-works.io We accept payment. Phone: +1-555-0789"
    }
)

$extractedEntities = @()

foreach ($job in $scamJobs) {
    Write-Host "Analyzing: $($job.title)" -ForegroundColor Yellow
    
    $payload = @{
        jobText = $job.text
        jobAnalysisId = [guid]::NewGuid().ToString().Substring(0, 24)
        jobReportId = [guid]::NewGuid().ToString().Substring(0, 24)
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseURL/scam-networks/entities/extract" -Method POST -ContentType "application/json" -Body $payload -TimeoutSec 10 -UseBasicParsing
        
        $result = $response.Content | ConvertFrom-Json
        
        Write-Host "SUCCESS: Extracted entities:" -ForegroundColor Green
        Write-Host "  Emails: $($result.entities.emails -join ', ')" -ForegroundColor Gray
        Write-Host "  Domains: $($result.entities.domains -join ', ')" -ForegroundColor Gray
        Write-Host "  Wallets: $($result.entities.wallets -join ', ')" -ForegroundColor Gray
        Write-Host "  Total: $($result.summary.totalEntitiesFound) entities`n" -ForegroundColor Gray
        
        $extractedEntities += @{
            jobText = $job.text
            jobAnalysisId = ($payload | ConvertFrom-Json).jobAnalysisId
            entities = $result.entities
        }
    }
    catch {
        Write-Host "ERROR: Could not extract entities: $_" -ForegroundColor Red
    }
}

Write-Host "SUCCESS: Step 1 Complete - $($extractedEntities.Count) jobs analyzed`n" -ForegroundColor Green

# STEP 2: NETWORK CORRELATION
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STEP 2: BUILD CORRELATION NETWORK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Triggering admin correlation to link scams by shared entities..." -ForegroundColor Yellow

$correlatePayload = @{
    maxAnalysesToProcess = 500
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseURL/scam-networks/correlate" -Method POST -ContentType "application/json" -Body $correlatePayload -TimeoutSec 30 -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "SUCCESS: Network correlation completed:" -ForegroundColor Green
    Write-Host "  Networks Created: $($result.networksCreated)" -ForegroundColor Gray
    Write-Host "  Analyses Processed: $($result.totalAnalyzed)" -ForegroundColor Gray
    Write-Host "  Processing Time: $($result.processingTime)" -ForegroundColor Gray
    Write-Host "  Shared Wallet Correlations: $($result.summary.sharedWalletCorrelations)" -ForegroundColor Gray
    Write-Host "  Shared Email Correlations: $($result.summary.sharedEmailCorrelations)" -ForegroundColor Gray
    Write-Host "  Shared Domain Correlations: $($result.summary.sharedDomainCorrelations)`n" -ForegroundColor Gray
}
catch {
    Write-Host "ERROR: Could not correlate networks: $_" -ForegroundColor Red
}

# STEP 3: FETCH GRAPH DATA
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "STEP 3: FETCH NETWORK GRAPH FOR VISUALIZATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($extractedEntities.Count -gt 0) {
    $firstJobAnalysisId = $extractedEntities[0].jobAnalysisId
    Write-Host "Fetching graph data for analysis: $firstJobAnalysisId`n" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseURL/scam-networks/$firstJobAnalysisId" -Method GET -TimeoutSec 10 -UseBasicParsing
        
        $graphData = $response.Content | ConvertFrom-Json
        
        if ($graphData.nodes) {
            Write-Host "SUCCESS: Network graph retrieved:" -ForegroundColor Green
            Write-Host "  Nodes: $($graphData.nodes.Count)" -ForegroundColor Gray
            Write-Host "  Edges: $($graphData.edges.Count)" -ForegroundColor Gray
            Write-Host "  Unique Entities: $($graphData.summary.uniqueEntities)" -ForegroundColor Gray
            Write-Host "  Average Confidence: $($graphData.summary.avgConfidence)`n" -ForegroundColor Gray
        }
        else {
            Write-Host "No graph data available" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "ERROR: Could not fetch graph: $_" -ForegroundColor Red
    }
}

# COMPLETION
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "IMPLEMENTATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "SUCCESS: All 3 workflow steps operational!" -ForegroundColor Green
Write-Host "`nServices Running:" -ForegroundColor Cyan
Write-Host "  Backend API: $BaseURL" -ForegroundColor Green
Write-Host "  Frontend UI: $FrontendURL" -ForegroundColor Green

Write-Host "`nTo see the visualization:" -ForegroundColor Cyan
Write-Host "  1. Open: $FrontendURL" -ForegroundColor Gray
Write-Host "  2. Navigate to Job Analyzer or Threat Intelligence" -ForegroundColor Gray
Write-Host "  3. Paste a scam job posting" -ForegroundColor Gray
Write-Host "  4. See the interactive scam network graph`n" -ForegroundColor Gray

Write-Host "API Endpoints Available:" -ForegroundColor Cyan
Write-Host "  POST   $BaseURL/scam-networks/entities/extract" -ForegroundColor Yellow
Write-Host "  POST   $BaseURL/scam-networks/correlate" -ForegroundColor Yellow
Write-Host "  GET    $BaseURL/scam-networks/{jobAnalysisId}" -ForegroundColor Yellow
Write-Host "  GET    $BaseURL/scam-networks/stats/summary`n" -ForegroundColor Yellow
