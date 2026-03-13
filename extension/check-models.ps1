# Check available models for your API key

$API_KEY = "AIzaSyBXHyDAVgSuSUMaDmSXcpb8rBMAvNvqpQM"

Write-Host "🔍 Checking available models..."

try {
    # List available models
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$API_KEY" -Method GET
    Write-Host "✅ Available models:"
    $response.models | ForEach-Object {
        Write-Host "  - $($_.name)"
    }
} catch {
    Write-Host "❌ Error checking models: $($_.Exception.Message)"
    
    # Try the older endpoint
    try {
        Write-Host "🔄 Trying v1 endpoint..."
        $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1/models?key=$API_KEY" -Method GET
        Write-Host "✅ Available models (v1):"
        $response.models | ForEach-Object {
            Write-Host "  - $($_.name)"
        }
    } catch {
        Write-Host "❌ v1 endpoint also failed: $($_.Exception.Message)"
        Write-Host "💡 Possible issues:"
        Write-Host "   1. API key is invalid"
        Write-Host "   2. API key doesn't have Gemini API enabled"
        Write-Host "   3. Wrong API endpoint URL"
    }
}
