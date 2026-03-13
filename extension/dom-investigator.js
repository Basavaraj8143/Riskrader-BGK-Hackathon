// WhatsApp DOM Investigator - paste this in WhatsApp Web console
(function() {
    console.log('🔍 Investigating WhatsApp DOM structure...');
    
    function investigateWhatsAppDOM() {
        console.log('--- WhatsApp DOM Analysis ---');
        
        // Check all possible message containers
        const selectors = [
            '[data-testid="msg-container"]',
            '[data-testid="message"]',
            '[data-testid="conversation-panel-messages"]',
            '[data-testid="chat-panel"]',
            '.message',
            '.message-in',
            '.message-out',
            '.copyable-text',
            '[role="row"]',
            '.focusable-list-item'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                console.log('Sample element:', elements[0]);
            } else {
                console.log(`❌ No elements found for selector: ${selector}`);
            }
        });
        
        // Look for any element containing text
        const allTextElements = document.querySelectorAll('*');
        const messageCandidates = [];
        
        allTextElements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 10 && text.includes('Dear students')) {
                messageCandidates.push({
                    element: el,
                    text: text.substring(0, 50) + '...',
                    className: el.className,
                    testId: el.getAttribute('data-testid'),
                    tagName: el.tagName
                });
            }
        });
        
        console.log('🎯 Message candidates containing "Dear students":');
        messageCandidates.forEach((candidate, index) => {
            console.log(`${index + 1}. Tag: ${candidate.tagName}, Class: ${candidate.className}, TestId: ${candidate.testId}`);
            console.log(`   Text: ${candidate.text}`);
            console.log(`   Element:`, candidate.element);
        });
        
        // Get current active chat area
        const chatArea = document.querySelector('[data-testid="conversation-panel"]') ||
                         document.querySelector('[data-testid="main"]') ||
                         document.querySelector('.two');
        
        if (chatArea) {
            console.log('📱 Found chat area:', chatArea);
            console.log('Chat area children:', chatArea.children.length);
            
            // Look for any divs that might be messages
            const possibleMessages = chatArea.querySelectorAll('div');
            console.log(`Found ${possibleMessages.length} divs in chat area`);
            
            // Show first few divs with their attributes
            for (let i = 0; i < Math.min(10, possibleMessages.length); i++) {
                const div = possibleMessages[i];
                const text = div.textContent?.trim();
                if (text && text.length > 5) {
                    console.log(`Div ${i}: "${text.substring(0, 30)}..." | Class: ${div.className} | TestId: ${div.getAttribute('data-testid')}`);
                }
            }
        }
        
        console.log('--- End Analysis ---');
    }
    
    // Run investigation
    investigateWhatsAppDOM();
    
    // Also run every 5 seconds to catch changes
    setInterval(investigateWhatsAppDOM, 5000);
    
    console.log('🔄 DOM investigator running! Check console for results.');
})();
