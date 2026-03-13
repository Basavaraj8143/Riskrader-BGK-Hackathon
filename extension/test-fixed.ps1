# Fixed PowerShell test with correct model name

$API_KEY = "AIzaSyBXHyDAVgSuSUMaDmSXcpb8rBMAvNvqpQM"

# Try different model names that actually exist
$models = @(
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-pro-vision"
)

foreach ($model in $models) {
    Write-Host "🧪 Testing model: $model"
    
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
        $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/$model`:generateContent?key=$API_KEY" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "✅ SUCCESS with model: $model"
        Write-Host $response | ConvertTo-Json -Depth 10
        break
    } catch {
        Write-Host "❌ Failed with model: $model - $($_.Exception.Message)"
    }
}
