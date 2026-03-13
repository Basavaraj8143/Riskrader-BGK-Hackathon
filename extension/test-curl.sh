#!/bin/bash

echo "🧪 Testing Gemini API Key with curl..."

API_KEY="AIzaSyBXHyDAVgSuSUMaDmSXcpb8rBMAvNvqpQM"

# Create a simple test request
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, can you respond with just the word SUCCESS?"
      }]
    }]
  }' \
  --verbose

echo ""
echo "✅ Test completed. Check the response above."
