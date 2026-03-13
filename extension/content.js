// FinGuard AI - WhatsApp Web Integration
// DEBUG: This should appear in console if script loads
console.log('🚀 FinGuard content.js LOADED!');

class WhatsAppFraudDetector {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.widgetVisible = false;
        this.currentMessage = '';
        this.isAnalyzing = false;
        this.init();
    }

    init() {
        console.log('🚀 FinGuard AI: Starting initialization...');
        console.log('📱 Current URL:', window.location.href);
        console.log('🔍 DOM ready state:', document.readyState);
        
        // Check if WhatsApp messages exist yet
        const messages = document.querySelectorAll('[role="row"]');
        console.log('📊 Messages found on init:', messages.length);
        
        this.injectWidget();
        this.observeMessages();
        this.addKeyboardShortcut();
        
        // Wait a bit then scan
        setTimeout(() => {
            console.log('⏰ Delayed scan starting...');
            this.scanExistingMessages();
        }, 3000);
        
        this.showStatus('🔍 Ready - Click analyze icon next to any message', 'info');
    }

    scanExistingMessages() {
        // Use the correct selector based on DOM investigation
        const existingMessages = document.querySelectorAll('[role="row"]');
        console.log(`FinGuard: Found ${existingMessages.length} existing messages`);
        existingMessages.forEach(msg => this.processMessage(msg));
    }

    // Inject floating widget
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
                            <span class="status-indicator">🔍 Ready - Click analyze icon next to any message</span>
                        </div>
                        <div class="finguard-result" id="finguard-result"></div>
                        <div class="finguard-actions">
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
        const autoBtn = document.getElementById('finguard-auto');

        toggle.addEventListener('click', () => this.toggleWidget());
        close.addEventListener('click', () => this.hideWidget());
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

    // Observe WhatsApp messages
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
                // Check for message containers using correct selector
                const messages = node.querySelectorAll('[role="row"]') ||
                               (node.matches && node.matches('[role="row"]') ? [node] : []);
                
                messages.forEach(msg => this.processMessage(msg));
                
                // Also check if the node itself is a message
                if (node.matches && node.matches('[role="row"]')) {
                    this.processMessage(node);
                }
            }
        });
    }

    processMessage(messageElement) {
        console.log('🔍 Processing message element:', messageElement);
        console.log('📝 Element classes:', messageElement.className);
        console.log('🏷️ Element role:', messageElement.getAttribute('role'));
        
        const messageText = this.extractMessageText(messageElement);
        console.log('💬 Extracted text:', messageText ? messageText.substring(0, 50) + '...' : 'NULL');
        
        if (messageText) {
            console.log('✅ Text found, adding icon...');
            this.addAnalyzeIcon(messageElement, messageText);
        } else {
            console.log('❌ No text found in message element');
        }
    }

    addAnalyzeIcon(messageElement, messageText) {
        console.log('🎯 Adding icon to element with text:', messageText.substring(0, 30) + '...');
        console.log('📍 Element position style:', window.getComputedStyle(messageElement).position);
        
        // Check if icon already exists
        if (messageElement.querySelector('.finguard-analyze-icon')) {
            console.log('⚠️ Icon already exists, skipping...');
            return;
        }

        // Create the icon with the working style from test
        const icon = document.createElement('div');
        icon.className = 'finguard-analyze-icon';
        icon.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#10b981"/>
            </svg>
        `;
        icon.title = 'Analyze with FinGuard AI';
        icon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(16, 185, 129, 0.9);
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
            transition: all 0.2s ease;
        `;

        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('🔍 Icon clicked! Analyzing message...');
            this.analyzeMessage(messageText);
        });

        // Make parent relative and append icon
        messageElement.style.position = 'relative';
        messageElement.appendChild(icon);
        
        console.log('✅ Icon successfully added to DOM');
        console.log('🎨 Icon styles:', icon.style.cssText);
    }

    extractMessageText(messageElement) {
        console.log('🔍 Extracting text from element:', messageElement);
        
        // Use the correct selectors based on DOM investigation
        const selectors = [
            '._ak8j',           // Found in investigation - contains message text
            '._ak81._ap1_',     // Found in investigation - message container
            '.copyable-text',   // Standard WhatsApp selector
            '[data-testid="msg-text"]',
            'span.selectable-text'
        ];

        for (const selector of selectors) {
            const element = messageElement.querySelector(selector);
            console.log(`🔎 Trying selector "${selector}":`, element ? 'FOUND' : 'NOT FOUND');
            if (element && element.textContent.trim()) {
                const text = element.textContent.trim();
                console.log(`✅ Found text with "${selector}":`, text.substring(0, 50) + '...');
                return text;
            }
        }
        
        // Fallback to direct text content
        const directText = messageElement.textContent.trim();
        console.log('🔄 Fallback - direct text content:', directText.substring(0, 50) + '...');
        return directText;
    }

    updateMessageDisplay(message) {
        const messageDiv = document.getElementById('finguard-message');
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div class="message-preview">
                    <strong>Current Message:</strong>
                    <p>${this.truncateText(message, 150)}</p>
                </div>
            `;
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    async analyzeMessage(message) {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.showStatus('🔍 Analyzing...', 'analyzing');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) throw new Error('API request failed');
            
            const result = await response.json();
            this.displayResult(result);
            this.showStatus('✅ Analysis Complete', 'success');
            
        } catch (error) {
            console.error('FinGuard API Error:', error);
            this.showStatus('❌ API Error - Make sure backend is running', 'error');
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
        
        // Auto-show widget when analysis is complete
        if (!this.widgetVisible) {
            this.toggleWidget();
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('finguard-status');
        if (statusDiv) {
            const indicators = {
                'info': '🔍',
                'success': '✅',
                'warning': '⚠️',
                'error': '❌',
                'analyzing': '🔄'
            };
            
            statusDiv.innerHTML = `<span class="status-indicator">${indicators[type]} ${message}</span>`;
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
        });
    }
}

// Initialize when WhatsApp Web is ready
if (window.location.hostname === 'web.whatsapp.com') {
    // Wait for WhatsApp to load
    const initDetector = () => {
        if (document.querySelector('[data-testid="panel"]')) {
            new WhatsAppFraudDetector();
        } else {
            setTimeout(initDetector, 1000);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDetector);
    } else {
        initDetector();
    }
}
