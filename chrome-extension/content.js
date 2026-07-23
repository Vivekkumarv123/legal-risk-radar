// Content script for Legal Risk Radar Chrome Extension
console.log('Legal Risk Radar Content Script v2.0 - Registration Flow Loaded');

class LegalRiskRadarExtension {
    constructor() {
        this.init();
    }

    init() {
        this.createFloatingButton();
        this.setupContextMenu();
        this.setupTextSelection();
    }

    createFloatingButton() {
        // Create floating analysis button
        const button = document.createElement('div');
        button.id = 'lrr-floating-btn';
        button.innerHTML = '⚖️';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            font-size: 20px;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        });

        button.addEventListener('click', () => {
            this.showQuickAnalysis();
        });

        document.body.appendChild(button);
    }

    setupTextSelection() {
        let selectionTimeout;
        
        document.addEventListener('mouseup', () => {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText && selectedText.length > 10) {
                    this.showSelectionTooltip(selection);
                } else {
                    this.hideSelectionTooltip();
                }
            }, 100);
        });

        document.addEventListener('mousedown', () => {
            this.hideSelectionTooltip();
        });
    }

    showSelectionTooltip(selection) {
        this.hideSelectionTooltip();
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'lrr-selection-tooltip';
        tooltip.innerHTML = `
            <button id="lrr-analyze-selection">⚖️ Analyze Legal Risk</button>
        `;
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top - 50}px;
            left: ${rect.left + (rect.width / 2) - 75}px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const analyzeBtn = tooltip.querySelector('#lrr-analyze-selection');
        analyzeBtn.style.cssText = `
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 600;
        `;

        analyzeBtn.addEventListener('click', () => {
            this.analyzeSelectedText(selection.toString());
            this.hideSelectionTooltip();
        });

        document.body.appendChild(tooltip);
    }

    hideSelectionTooltip() {
        const existing = document.getElementById('lrr-selection-tooltip');
        if (existing) {
            existing.remove();
        }
    }

    async analyzeSelectedText(text) {
        try {
            // Show loading indicator
            this.showNotification('Analyzing text...', 'info');
            
            // Use background script for all requests to avoid CORS/loopback restrictions
            const analysis = await new Promise((resolve, reject) => {
                if (!chrome.runtime || !chrome.runtime.sendMessage) {
                    reject(new Error('Chrome extension runtime not available'));
                    return;
                }
                
                chrome.runtime.sendMessage({
                    action: 'analyzeText',
                    text: text.trim()
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else if (response && response.success) {
                        resolve(response.result);
                    } else {
                        reject(new Error(response?.error || 'Analysis failed'));
                    }
                });
            });
            
            // Show the analysis results in a popup
            this.showAnalysisResults(analysis);
            
        } catch (error) {
            console.error('Analysis error:', error);
            
            // Show appropriate error message
            if (error.message.includes('runtime not available')) {
                this.showNotification('❌ Extension error. Please reload the extension.', 'error');
            } else if (error.message.includes('loopback') || error.message.includes('CORS')) {
                this.showNotification('❌ Cannot connect to server. Please check your internet connection.', 'error');
            } else {
                this.showNotification(`❌ Analysis failed: ${error.message}`, 'error');
            }
        }
    }

    showQuickAnalysis() {
        // Create quick analysis modal
        const modal = document.createElement('div');
        modal.id = 'lrr-quick-modal';
        modal.innerHTML = `
            <div class="lrr-modal-content">
                <div class="lrr-modal-header">
                    <h3>Legal Risk Radar</h3>
                    <button id="lrr-close-modal">×</button>
                </div>
                <div class="lrr-modal-body">
                    <p>Select text on this page to analyze legal risks, or use these quick actions:</p>
                    <div class="lrr-quick-actions">
                        <button id="lrr-scan-page">🔍 Scan Entire Page</button>
                        <button id="lrr-open-app">🚀 Register for Full Access</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // Add styles for modal content
        const style = document.createElement('style');
        style.textContent = `
            .lrr-modal-content {
                background: white;
                border-radius: 12px;
                width: 400px;
                max-width: 90vw;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }
            .lrr-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            .lrr-modal-header h3 {
                margin: 0;
                font-size: 18px;
                color: #1f2937;
            }
            .lrr-modal-body {
                padding: 20px;
            }
            .lrr-quick-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 15px;
            }
            .lrr-quick-actions button {
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            .lrr-quick-actions button:hover {
                background: #f9fafb;
                border-color: #3b82f6;
            }
            #lrr-close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);

        // Event listeners
        modal.querySelector('#lrr-close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.querySelector('#lrr-scan-page').addEventListener('click', () => {
            this.scanEntirePage();
            modal.remove();
            style.remove();
        });

        modal.querySelector('#lrr-open-app').addEventListener('click', () => {
            const confirmMessage = `Legal Risk Radar offers powerful AI-driven legal analysis tools.\n\nRegister for free to access:\n• Detailed document analysis\n• Risk assessment reports\n• Legal recommendations\n• Document comparison\n• Save & share features\n\nContinue to registration?`;
            
            if (confirm(confirmMessage)) {
                window.open('https://legal-risk-radar.vercel.app/pages/signup', '_blank');
            }
            modal.remove();
            style.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });

        document.body.appendChild(modal);
    }

    scanEntirePage() {
        // Get all text content from the page, excluding script and style elements
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and other non-content elements
                    const parent = node.parentElement;
                    if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip very short text nodes
                    if (node.textContent.trim().length < 10) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let pageText = '';
        let node;
        while (node = walker.nextNode()) {
            pageText += node.textContent.trim() + ' ';
        }

        // Limit to first 8000 characters for analysis
        const textToAnalyze = pageText.substring(0, 8000).trim();
        
        if (textToAnalyze.length < 50) {
            this.showNotification('Not enough text content found on this page to analyze', 'error');
            return;
        }

        this.showNotification(`Analyzing ${textToAnalyze.length} characters from this page...`, 'info');
        this.analyzeSelectedText(textToAnalyze);
    }

    showAnalysisResults(analysis) {
        console.log('Legal Risk Radar: Creating analysis popup with registration flow');
        
        // Remove any existing analysis popup
        const existing = document.getElementById('lrr-analysis-popup');
        if (existing) {
            existing.remove();
        }

        const popup = document.createElement('div');
        popup.id = 'lrr-analysis-popup';
        
        // Extract analysis data
        const analysisData = analysis.analysis || {};
        const riskScore = analysisData.overall_risk_score || 'N/A';
        const summary = analysisData.summary || 'Analysis completed';
        const clauses = analysisData.clauses || [];
        const missingProtections = analysisData.missing_protections || analysisData.missing_clauses || [];

        popup.innerHTML = `
            <div class="lrr-popup-content">
                <div class="lrr-popup-header">
                    <div class="lrr-popup-title">
                        <span class="lrr-popup-icon">⚖️</span>
                        Legal Risk Analysis
                    </div>
                    <button id="lrr-close-analysis" class="lrr-close-btn">×</button>
                </div>
                <div class="lrr-popup-body">
                    <div class="lrr-risk-score">
                        <div class="lrr-score-circle ${this.getRiskClass(riskScore)}">
                            <span class="lrr-score-number">${riskScore}</span>
                            <span class="lrr-score-label">/10</span>
                        </div>
                        <div class="lrr-risk-level">${this.getRiskLevel(riskScore)} Risk</div>
                    </div>
                    
                    <div class="lrr-summary">
                        <h4>Summary</h4>
                        <p>${summary}</p>
                    </div>
                    
                    ${clauses.length > 0 ? `
                        <div class="lrr-clauses">
                            <h4>Key Issues Found</h4>
                            ${clauses.slice(0, 3).map(clause => `
                                <div class="lrr-clause-item ${this.getRiskClass(clause.risk_level)}">
                                    <div class="lrr-clause-risk">${clause.risk_level || 'Medium'} Risk</div>
                                    <div class="lrr-clause-text">${clause.clause || clause.issue || 'Issue identified'}</div>
                                </div>
                            `).join('')}
                            ${clauses.length > 3 ? `<p class="lrr-more-issues">+${clauses.length - 3} more issues found</p>` : ''}
                        </div>
                    ` : ''}
                    
                    ${missingProtections.length > 0 ? `
                        <div class="lrr-missing">
                            <h4>Missing Protections</h4>
                            <ul>
                                ${missingProtections.slice(0, 3).map(protection => `
                                    <li>${protection}</li>
                                `).join('')}
                                ${missingProtections.length > 3 ? `<li>+${missingProtections.length - 3} more protections needed</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="lrr-actions">
                        <button id="lrr-full-analysis" class="lrr-btn-primary">
                            🚀 Get Full Analysis - Register Free
                        </button>
                        <button id="lrr-close-results" class="lrr-btn-secondary">
                            Close
                        </button>
                    </div>
                    
                    <div class="lrr-upgrade-note">
                        <p><strong>🎯 Want More?</strong> Register for free to get:</p>
                        <ul>
                            <li>✅ Detailed AI-powered risk analysis</li>
                            <li>✅ Clause-by-clause breakdown</li>
                            <li>✅ Legal recommendations</li>
                            <li>✅ Document comparison tools</li>
                            <li>✅ Save and share analyses</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.id = 'lrr-analysis-styles';
        style.textContent = `
            #lrr-analysis-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10004;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: lrr-fadeIn 0.3s ease;
            }
            
            @keyframes lrr-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .lrr-popup-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: lrr-slideUp 0.3s ease;
            }
            
            @keyframes lrr-slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .lrr-popup-header {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .lrr-popup-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 18px;
                font-weight: 600;
            }
            
            .lrr-popup-icon {
                font-size: 20px;
            }
            
            .lrr-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            
            .lrr-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .lrr-popup-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .lrr-risk-score {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .lrr-score-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px;
                border: 4px solid;
                font-weight: bold;
            }
            
            .lrr-score-circle.low-risk {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
            }
            
            .lrr-score-circle.medium-risk {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
            }
            
            .lrr-score-circle.high-risk {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
            }
            
            .lrr-score-number {
                font-size: 24px;
                line-height: 1;
            }
            
            .lrr-score-label {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .lrr-risk-level {
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .lrr-summary, .lrr-clauses, .lrr-missing {
                margin-bottom: 20px;
            }
            
            .lrr-summary h4, .lrr-clauses h4, .lrr-missing h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .lrr-summary p {
                margin: 0;
                color: #4b5563;
                line-height: 1.5;
            }
            
            .lrr-clause-item {
                margin-bottom: 12px;
                padding: 12px;
                border-radius: 8px;
                border-left: 4px solid;
            }
            
            .lrr-clause-item.low-risk {
                background: rgba(16, 185, 129, 0.05);
                border-left-color: #10b981;
            }
            
            .lrr-clause-item.medium-risk {
                background: rgba(245, 158, 11, 0.05);
                border-left-color: #f59e0b;
            }
            
            .lrr-clause-item.high-risk {
                background: rgba(239, 68, 68, 0.05);
                border-left-color: #ef4444;
            }
            
            .lrr-clause-risk {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
                color: #6b7280;
            }
            
            .lrr-clause-text {
                font-size: 14px;
                color: #374151;
                line-height: 1.4;
            }
            
            .lrr-more-issues {
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
                margin: 8px 0 0 0;
            }
            
            .lrr-missing ul {
                margin: 0;
                padding-left: 20px;
                color: #4b5563;
            }
            
            .lrr-missing li {
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .lrr-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }
            
            .lrr-btn-primary, .lrr-btn-secondary {
                flex: 1;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }
            
            .lrr-btn-primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
            }
            
            .lrr-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .lrr-btn-secondary {
                background: #f9fafb;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .lrr-btn-secondary:hover {
                background: #f3f4f6;
            }
            
            .lrr-upgrade-note {
                margin-top: 20px;
                padding: 16px;
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border: 1px solid #0ea5e9;
                border-radius: 8px;
                font-size: 13px;
            }
            
            .lrr-upgrade-note p {
                margin: 0 0 8px 0;
                color: #0c4a6e;
                font-weight: 600;
            }
            
            .lrr-upgrade-note ul {
                margin: 0;
                padding-left: 16px;
                color: #0369a1;
            }
            
            .lrr-upgrade-note li {
                margin-bottom: 4px;
                font-size: 12px;
            }
        `;

        if (!document.getElementById('lrr-analysis-styles')) {
            document.head.appendChild(style);
        }

        // Event listeners
        popup.querySelector('#lrr-close-analysis').addEventListener('click', () => {
            popup.remove();
        });

        popup.querySelector('#lrr-close-results').addEventListener('click', () => {
            popup.remove();
        });

        popup.querySelector('#lrr-full-analysis').addEventListener('click', () => {
            // Show registration prompt before redirecting
            const confirmMessage = `To access the full analysis with detailed insights, risk assessments, and AI-powered recommendations, please register on our platform.\n\nWould you like to continue to Legal Risk Radar?`;
            
            if (confirm(confirmMessage)) {
                window.open('https://legal-risk-radar.vercel.app/pages/signup', '_blank');
            }
            popup.remove();
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });

        document.body.appendChild(popup);
        
        // Show success notification
        this.showNotification('Analysis complete! 🎉', 'success');
    }

    getRiskClass(riskLevel) {
        if (typeof riskLevel === 'string') {
            const level = riskLevel.toLowerCase();
            if (level.includes('high') || level.includes('critical')) return 'high-risk';
            if (level.includes('medium') || level.includes('moderate')) return 'medium-risk';
            return 'low-risk';
        }
        
        const score = parseInt(riskLevel);
        if (score >= 7) return 'high-risk';
        if (score >= 4) return 'medium-risk';
        return 'low-risk';
    }

    getRiskLevel(riskScore) {
        const score = parseInt(riskScore);
        if (score >= 7) return 'High';
        if (score >= 4) return 'Medium';
        return 'Low';
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10003;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 300px;
            animation: lrr-slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lrr-slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        if (!document.querySelector('style[data-lrr-notifications]')) {
            style.setAttribute('data-lrr-notifications', 'true');
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'lrr-slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setupContextMenu() {
        // Context menu will be handled by background script
    }
}

// Initialize the extension
new LegalRiskRadarExtension();