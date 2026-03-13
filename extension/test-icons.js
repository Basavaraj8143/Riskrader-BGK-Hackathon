// Quick test script - paste this in WhatsApp Web console
(function() {
    console.log('🧪 Testing FinGuard Icon Injection...');
    
    // Simple icon injection test
    function addTestIcon() {
        const messages = document.querySelectorAll('[data-testid="msg-container"], [data-testid="message"], .message');
        
        messages.forEach((msg, index) => {
            if (msg.querySelector('.finguard-test-icon')) return;
            
            const icon = document.createElement('div');
            icon.className = 'finguard-test-icon';
            icon.innerHTML = '🔍';
            icon.style.cssText = `
                position: absolute;
                right: 10px;
                top: 5px;
                cursor: pointer;
                background: #10b981;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                z-index: 9999;
            `;
            
            icon.title = 'Test FinGuard Icon';
            icon.addEventListener('click', () => {
                alert('FinGuard test clicked on message ' + (index + 1));
            });
            
            msg.style.position = 'relative';
            msg.appendChild(icon);
        });
        
        console.log(`✅ Added test icons to ${messages.length} messages`);
    }
    
    // Run test
    addTestIcon();
    
    // Auto-run every 2 seconds for new messages
    setInterval(addTestIcon, 2000);
    
    console.log('🎯 Test script loaded! Look for 🔍 icons next to messages.');
})();
