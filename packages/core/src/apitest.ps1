# Helper function to make API requests
function Invoke-ApiRequest {
    param (
        [string]$endpoint,
        [string]$method = "GET",
        [hashtable]$body = @{},
        [string]$contentType = "application/json"
    )

    $uri = "http://localhost:8000/$endpoint"
    $maxRetries = 3
    $retryDelay = 5

    $headers = @{}
    if ($contentType) {
        $headers["Content-Type"] = $contentType
    }

    $bodyJson = ""
    if ($body) {
        $bodyJson = $body | ConvertTo-Json -Depth 10
    }

    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $uri -Method $method -Headers $headers -Body $bodyJson -UseBasicParsing
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                Write-Host "Success: $endpoint"
                if ($response.Content) {
                    Write-Host "Response:"
                    $response.Content | ConvertFrom-Json -Depth 10 | ConvertTo-Json -Depth 10
                }
                return
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 429) {
                if ($i -lt $maxRetries) {
                    Write-Host "Rate limit exceeded. Waiting $retryDelay seconds before retry $i of $maxRetries..."
                    Start-Sleep -Seconds $retryDelay
                    $retryDelay *= 2  # Exponential backoff
                    continue
                }
            }
            Write-Host "Exception: $endpoint - $($_.Exception.Message)"
            break
        }
    }
}

# Test /health endpoint
Invoke-ApiRequest -endpoint "health"

# Test /hexagrams/generate endpoint
$divinationBody = @{
    mode = "random"
}
Invoke-ApiRequest -endpoint "hexagrams/generate" -method "POST" -body $divinationBody

# Test /hexagrams/1 endpoint
Invoke-ApiRequest -endpoint "hexagrams/1"

# Test /interpretations/hexagram endpoint
$interpretHexagramBody = @{
    hexagram_number = 1
}
Invoke-ApiRequest -endpoint "interpretations/hexagram" -method "POST" -body $interpretHexagramBody

# Test /interpretations/line endpoint
$interpretLineBody = @{
    hexagram_number = 1
    line_number = 1
}
Invoke-ApiRequest -endpoint "interpretations/line" -method "POST" -body $interpretLineBody

# Test /interpretations/comprehensive endpoint
# This test will fail until you implement the logic to send a ReadingResponse object
# Invoke-ApiRequest -endpoint "interpretations/comprehensive" -method "POST" -body $comprehensiveBody

# Test /chat/start endpoint
Invoke-ApiRequest -endpoint "chat/start" -method "POST"

# Test /chat/message endpoint
$chatMessageBody = @{
    role = "user"
    content = "Hello, I have a question about the I Ching."
}
Invoke-ApiRequest -endpoint "chat/message" -method "POST" -body $chatMessageBody

# Test /chat/enhanced endpoint
$enhancedInterpretationBody = @{
    hexagram_number = 1
}
Invoke-ApiRequest -endpoint "chat/enhanced" -method "POST" -body $enhancedInterpretationBody