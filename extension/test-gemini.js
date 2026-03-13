// Test Gemini API Key - paste this in console
(async function() {
    console.log('🧪 Testing Gemini API Key...');
    
    const apiKey = 'AIzaSyBaM128RUobVCY5vCDYhYE5-Iuw6Hks5lY';
    
    // Create a test image (1x1 pixel transparent PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const testDataUrl = canvas.toDataURL('image/png');
    const base64Data = testDataUrl.split(',')[1];
    
    try {
        console.log('📡 Sending request to Gemini API...');
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Extract all visible text from this image. Return only the extracted text, nothing else."
                    }, {
                        inline_data: {
                            mime_type: "image/png",
                            data: base64Data
                        }
                    }]
                }]
            })
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', [...response.headers.entries()]);

        const data = await response.json();
        console.log('📋 Full response:', data);

        if (response.ok) {
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const extractedText = data.candidates[0].content.parts[0].text;
                console.log('✅ API Key Working! Extracted text:', extractedText);
                console.log('🎉 Your Gemini API key is valid and working!');
            } else {
                console.log('⚠️ API responded but no content found');
                console.log('📋 Response structure:', JSON.stringify(data, null, 2));
            }
        } else {
            console.log('❌ API Error:', data);
            if (data.error) {
                console.log('🔍 Error details:', data.error.message);
                if (data.error.code === 400) {
                    console.log('💡 Possible issues: Invalid API key, model not available, or bad request format');
                } else if (data.error.code === 403) {
                    console.log('💡 Possible issues: API key permissions or quota exceeded');
                }
            }
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        console.log('💡 Possible issues: Network connectivity, CORS, or API endpoint');
    }
})();
