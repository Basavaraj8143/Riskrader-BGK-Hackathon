# Direct PowerShell command - copy and paste this

$API_KEY = "AIzaSyBXHyDAVgSuSUMaDmSXcpb8rBMAvNvqpQM"
$body = @{contents = @{parts = @(@{text = "Hello, can you respond with just the word SUCCESS?"})}} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" -Method POST -ContentType "application/json" -Body $body -Verbose
    Write-Host "✅ API Key Working!"
    Write-Host $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ API Error:"
    Write-Host $_.Exception.Message
}
