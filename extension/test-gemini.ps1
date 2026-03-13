# PowerShell script to test Gemini API key

Write-Host "🧪 Testing Gemini API Key with PowerShell..."

$API_KEY = "AIzaSyBXHyDAVgSuSUMaDmSXcpb8rBMAvNvqpQM"

$body = @{
    contents = @{
        parts = @(
            @{
                text = "Hello, can you respond with just the word SUCCESS?"
            }
        )
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" `
                                -Method POST `
                                -ContentType "application/json" `
                                -Body $body `
                                -Verbose

    Write-Host "✅ Response received:"
    Write-Host $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error occurred:"
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response | ConvertTo-Json -Depth 10
}

Write-Host "✅ Test completed."
