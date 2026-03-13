// Quick demo injection script - paste this in WhatsApp Web console
(function() {
    console.log('🚀 Starting FinGuard AI Demo Injection...');
    
    // Check if already injected
    if (document.getElementById('finguard-widget')) {
        console.log('✅ FinGuard AI already loaded');
        return;
    }
    
    // Inject CSS
    const css = `
        #finguard-widget { position: fixed; top: 20px; right: 20px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .finguard-widget-container { position: relative; }
        .finguard-toggle { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease; color: white; }
        .finguard-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); }
        .finguard-panel { position: absolute; top: 70px; right: 0; width: 380px; max-height: 600px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); display: none; overflow: hidden; }
        .finguard-header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .finguard-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
        .finguard-close { background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s; }
        .finguard-close:hover { background: rgba(255, 255, 255, 0.2); }
        .finguard-content { padding: 20px; max-height: 500px; overflow-y: auto; }
        .finguard-status { margin-bottom: 16px; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 4px solid #10b981; }
        .status-indicator { font-weight: 500; color: #059669; }
        .finguard-message { margin-bottom: 16px; }
        .message-preview { background: rgba(0, 0, 0, 0.05); padding: 12px; border-radius: 8px; border-left: 4px solid #6b7280; }
        .message-preview strong { color: #374151; display: block; margin-bottom: 8px; }
        .message-preview p { margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4; }
        .finguard-result { margin-bottom: 20px; }
        .analysis-result { background: white; border-radius: 12px; padding: 16px; border: 1px solid rgba(0, 0, 0, 0.1); animation: slideIn 0.3s ease-out; }
        .risk-score { text-align: center; padding: 16px; border: 2px solid #10b981; border-radius: 12px; margin-bottom: 16px; background: rgba(16, 185, 129, 0.05); }
        .score-value { font-size: 32px; font-weight: bold; margin-bottom: 4px; color: #10b981; }
        .score-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .detail-item { margin-bottom: 12px; }
        .detail-item strong { color: #374151; display: block; margin-bottom: 4px; font-size: 14px; }
        .detail-item p { margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4; }
        .detail-item ul { margin: 4px 0 0 0; padding-left: 16px; }
        .detail-item li { color: #ef4444; font-size: 12px; margin-bottom: 2px; }
        .finguard-actions { display: flex; flex-direction: column; gap: 8px; }
        .finguard-btn { padding: 12px 16px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .finguard-btn.primary { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .finguard-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .finguard-btn.secondary { background: rgba(107, 114, 128, 0.1); color: #374151; border: 1px solid rgba(107, 114, 128, 0.2); }
        .finguard-btn.secondary:hover { background: rgba(107, 114, 128, 0.2); }
        .finguard-btn.secondary.active { background: #10b981; color: white; border-color: #10b981; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
    
    // Inject the main detector class (simplified version)
    class WhatsAppFraudDetector {
        constructor() {
            this.apiBaseUrl = 'http://localhost:8000';
            this.widgetVisible = false;
            this.currentMessage = '';
            this.isAnalyzing = false;
            this.autoDetectEnabled = false;
            this.init();
        }

        init() {
            console.log('🛡️ FinGuard AI: WhatsApp Fraud Detector initialized');
            this.injectWidget();
            this.observeMessages();
            this.addKeyboardShortcut();
            this.showStatus('🔍 Ready - Click any message to analyze', 'info');
        }

        injectWidget() {
            const widgetContainer = document.createElement('div');
            widgetContainer.id = 'finguard-widget';
            widgetContainer.innerHTML = `
                <div class="finguard-widget-container">
                    <div class="finguard-toggle" id="finguard-toggle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="finguard-panel" id="finguard-panel">
                        <div class="finguard-header">
                            <h3>FinGuard AI</h3>
                            <button class="finguard-close" id="finguard-close">×</button>
                        </div>
                        <div class="finguard-content">
                            <div class="finguard-status" id="finguard-status">
                                <span class="status-indicator">🔍 Ready</span>
                            </div>
                            <div class="finguard-message" id="finguard-message"></div>
                            <div class="finguard-result" id="finguard-result"></div>
                            <div class="finguard-actions">
                                <button class="finguard-btn primary" id="finguard-analyze">Analyze Current Message</button>
                                <button class="finguard-btn secondary" id="finguard-auto">Auto-Detect: OFF</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(widgetContainer);
            this.attachWidgetEvents();
        }

        attachWidgetEvents() {
            const toggle = document.getElementById('finguard-toggle');
            const close = document.getElementById('finguard-close');
            const analyzeBtn = document.getElementById('finguard-analyze');
            const autoBtn = document.getElementById('finguard-auto');

            toggle.addEventListener('click', () => this.toggleWidget());
            close.addEventListener('click', () => this.hideWidget());
            analyzeBtn.addEventListener('click', () => this.analyzeCurrentMessage());
            autoBtn.addEventListener('click', () => this.toggleAutoDetect());
        }

        toggleWidget() {
            const panel = document.getElementById('finguard-panel');
            this.widgetVisible = !this.widgetVisible;
            panel.style.display = this.widgetVisible ? 'block' : 'none';
        }

        hideWidget() {
            const panel = document.getElementById('finguard-panel');
            this.widgetVisible = false;
            panel.style.display = 'none';
        }

        observeMessages() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        this.checkNewMessages(mutation.addedNodes);
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        checkNewMessages(nodes) {
            nodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const messages = node.querySelectorAll('[data-testid="msg-container"]') || 
                                   (node.matches && node.matches('[data-testid="msg-container"]') ? [node] : []);
                    
                    messages.forEach(msg => this.processMessage(msg));
                }
            });
        }

        processMessage(messageElement) {
            // Add click listener to messages
            messageElement.addEventListener('click', () => {
                const messageText = this.extractMessageText(messageElement);
                if (messageText) {
                    this.currentMessage = messageText;
                    this.updateMessageDisplay(messageText);
                    
                    if (this.autoDetectEnabled && !this.isAnalyzing) {
                        setTimeout(() => this.analyzeMessage(messageText), 500);
                    }
                }
            });
        }

        extractMessageText(messageElement) {
            const selectors = [
                '[data-testid="msg-text"]',
                '.copyable-text',
                'span.selectable-text'
            ];

            for (const selector of selectors) {
                const element = messageElement.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            return '';
        }

        updateMessageDisplay(message) {
            const messageDiv = document.getElementById('finguard-message');
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div class="message-preview">
                        <strong>Current Message:</strong>
                        <p>${message.length > 150 ? message.substring(0, 150) + '...' : message}</p>
                    </div>
                `;
            }
        }

        async analyzeCurrentMessage() {
            if (!this.currentMessage) {
                this.showStatus('⚠️ Click on a message first', 'warning');
                return;
            }
            await this.analyzeMessage(this.currentMessage);
        }

        async analyzeMessage(message) {
            if (this.isAnalyzing) return;
            
            this.isAnalyzing = true;
            this.showStatus('🔍 Analyzing...', 'analyzing');
            
            try {
                const response = await fetch(`${this.apiBaseUrl}/api/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });

                if (!response.ok) throw new Error('API request failed');
                
                const result = await response.json();
                this.displayResult(result);
                this.showStatus('✅ Analysis Complete', 'success');
                
            } catch (error) {
                console.error('FinGuard API Error:', error);
                this.showStatus('❌ Backend not running - Start with: uvicorn main:app --reload', 'error');
            } finally {
                this.isAnalyzing = false;
            }
        }

        displayResult(result) {
            const resultDiv = document.getElementById('finguard-result');
            if (!resultDiv) return;

            const riskLevel = result.risk_level || 'UNKNOWN';
            const riskScore = result.risk_score || 0;
            const category = result.category || 'Unknown';
            const explanation = result.explanation || 'No explanation available';

            const riskColors = {
                'HIGH': '#ef4444',
                'MEDIUM': '#f59e0b',
                'LOW': '#10b981'
            };

            const riskColor = riskColors[riskLevel] || '#6b7280';

            resultDiv.innerHTML = `
                <div class="analysis-result">
                    <div class="risk-score" style="border-color: ${riskColor}">
                        <div class="score-value" style="color: ${riskColor}">${riskScore}/100</div>
                        <div class="score-label">${riskLevel} RISK</div>
                    </div>
                    <div class="analysis-details">
                        <div class="detail-item">
                            <strong>Category:</strong> ${category}
                        </div>
                        <div class="detail-item">
                            <strong>Explanation:</strong>
                            <p>${explanation}</p>
                        </div>
                        ${result.matched_patterns && result.matched_patterns.length > 0 ? `
                            <div class="detail-item">
                                <strong>Suspicious Patterns:</strong>
                                <ul>${result.matched_patterns.map(p => `<li>${p}</li>`).join('')}</ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('finguard-status');
            if (statusDiv) {
                statusDiv.innerHTML = `<span class="status-indicator">${message}</span>`;
            }
        }

        toggleAutoDetect() {
            this.autoDetectEnabled = !this.autoDetectEnabled;
            const autoBtn = document.getElementById('finguard-auto');
            if (autoBtn) {
                autoBtn.textContent = `Auto-Detect: ${this.autoDetectEnabled ? 'ON' : 'OFF'}`;
                autoBtn.classList.toggle('active', this.autoDetectEnabled);
            }
            this.showStatus(this.autoDetectEnabled ? '🤖 Auto-Detect Enabled' : '🔍 Auto-Detect Disabled', 'info');
        }

        addKeyboardShortcut() {
            document.addEventListener('keydown', (e) => {
                // Alt + Shift + G to toggle widget (G for FinGuard)
                if (e.altKey && e.shiftKey && e.key === 'G') {
                    e.preventDefault();
                    this.toggleWidget();
                }
                // Alt + Shift + A to analyze current message
                if (e.altKey && e.shiftKey && e.key === 'A') {
                    e.preventDefault();
                    this.analyzeCurrentMessage();
                }
            });
        }
    }

    // Initialize the detector
    new WhatsAppFraudDetector();
    
    console.log('✅ FinGuard AI Demo Injection Complete!');
    console.log('🎯 Shortcuts: Ctrl+Shift+F (toggle), Ctrl+Shift+A (analyze)');
    console.log('💡 Click on any WhatsApp message to analyze it');
})();
