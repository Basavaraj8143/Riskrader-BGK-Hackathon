// Simple working demo - paste this in any website console
(function() {
    console.log('🚀 FinGuard Simple Demo Loading...');
    
    // Create widget
    const widget = document.createElement('div');
    widget.id = 'finguard-simple-widget';
    widget.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; z-index: 999999; font-family: Arial, sans-serif;">
            <button id="finguard-demo-btn" style="
                width: 60px; 
                height: 60px; 
                border-radius: 50%; 
                background: linear-gradient(135deg, #10b981, #059669); 
                border: none; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); 
                color: white; 
                font-size: 24px;
            ">🔍</button>
            
            <div id="finguard-demo-panel" style="
                position: absolute; 
                top: 70px; 
                right: 0; 
                width: 400px; 
                background: white; 
                border-radius: 12px; 
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
                padding: 20px; 
                display: none; 
                border: 1px solid #e5e7eb;
            ">
                <h3 style="margin: 0 0 16px 0; color: #10b981;">🛡️ FinGuard AI Analysis</h3>
                <div id="finguard-demo-status" style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 16px; color: #166534;">
                    Ready for fraud detection
                </div>
                <button id="finguard-analyze-btn" style="
                    width: 100%; 
                    padding: 16px; 
                    background: linear-gradient(135deg, #10b981, #059669); 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    margin-bottom: 16px;
                ">📸 Analyze Screen for Fraud</button>
                <div id="finguard-demo-result"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(widget);
    
    // Event handlers
    const toggleBtn = document.getElementById('finguard-demo-btn');
    const panel = document.getElementById('finguard-demo-panel');
    const analyzeBtn = document.getElementById('finguard-analyze-btn');
    const status = document.getElementById('finguard-demo-status');
    const result = document.getElementById('finguard-demo-result');
    
    toggleBtn.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });
    
    analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '🔍 Analyzing...';
        status.innerHTML = '📸 Capturing screen...';
        result.innerHTML = '';
        
        // Simulate analysis steps
        await new Promise(resolve => setTimeout(resolve, 1000));
        status.innerHTML = '🤖 Extracting text with AI...';
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        status.innerHTML = '🧠 Analyzing for fraud patterns...';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate realistic results
        const analyses = [
            {
                score: 85,
                level: 'HIGH',
                category: 'KYC Phishing',
                explanation: 'This message contains urgent language and requests sensitive information, common tactics in phishing attacks.',
                patterns: ['Urgent action required', 'Account suspension threat', 'Suspicious link']
            },
            {
                score: 72,
                level: 'HIGH', 
                category: 'UPI Fraud',
                explanation: 'Message requests immediate payment through UPI with pressure tactics, typical of financial scams.',
                patterns: ['Payment urgency', 'Threat of penalty', 'UPI request']
            },
            {
                score: 68,
                level: 'MEDIUM',
                category: 'Investment Scam',
                explanation: 'Promises unrealistic returns with pressure to invest quickly, red flags for investment fraud.',
                patterns: ['High returns promise', 'Limited time offer', 'Investment pressure']
            }
        ];
        
        const analysis = analyses[Math.floor(Math.random() * analyses.length)];
        
        status.innerHTML = '✅ Analysis complete!';
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '📸 Analyze Screen for Fraud';
        
        const color = analysis.level === 'HIGH' ? '#ef4444' : analysis.level === 'MEDIUM' ? '#f59e0b' : '#10b981';
        
        result.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
                <div style="text-align: center; padding: 16px; border: 2px solid ${color}; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-size: 32px; font-weight: bold; color: ${color};">${analysis.score}/100</div>
                    <div style="font-size: 12px; font-weight: bold; color: ${color}; text-transform: uppercase;">${analysis.level} RISK</div>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Category:</strong> ${analysis.category}
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Explanation:</strong>
                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${analysis.explanation}</p>
                </div>
                <div>
                    <strong>Suspicious Patterns:</strong>
                    <ul style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
                        ${analysis.patterns.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    
    console.log('✅ FinGuard Demo Ready! Click the 🔍 button to start.');
})();
