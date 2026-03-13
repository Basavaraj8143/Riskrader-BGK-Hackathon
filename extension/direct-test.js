// Direct icon injection test - paste this in console
(function() {
    console.log('🎯 Direct icon injection test...');
    
    const messages = document.querySelectorAll('[role="row"]');
    console.log(`Found ${messages.length} messages`);
    
    let iconsAdded = 0;
    
    messages.forEach((msg, index) => {
        // Skip first few messages (might be headers)
        if (index < 3) return;
        
        // Check if already has icon
        if (msg.querySelector('.finguard-test-icon')) return;
        
        // Get message text
        const text = msg.textContent.trim();
        if (text.length < 10) return;
        
        // Create a very visible test icon
        const icon = document.createElement('div');
        icon.className = 'finguard-test-icon';
        icon.innerHTML = '🔍';
        icon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff0000;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10000;
            font-size: 16px;
            border: 2px solid white;
        `;
        
        icon.title = `Test: ${text.substring(0, 30)}...`;
        icon.addEventListener('click', () => {
            alert(`Message ${index}: ${text.substring(0, 100)}`);
        });
        
        // Make parent relative
        msg.style.position = 'relative';
        msg.appendChild(icon);
        
        iconsAdded++;
        console.log(`Added icon ${iconsAdded} to message: ${text.substring(0, 30)}...`);
        
        // Stop after 5 icons for testing
        if (iconsAdded >= 5) {
            console.log('✅ Added 5 test icons! Look for red 🔍 icons.');
            return;
        }
    });
    
    console.log(`🎯 Test complete! Added ${iconsAdded} icons.`);
})();
