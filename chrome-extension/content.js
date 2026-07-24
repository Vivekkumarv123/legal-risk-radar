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

        button.addEventListener('mousedown', (event) => {
            event.preventDefault(); // Prevents selection from clearing
        });

        button.addEventListener('click', () => {
            const selection = window.getSelection().toString().trim();
            if (selection && selection.length > 10) {
                this.analyzeSelectedText(selection);
            } else {
                this.showQuickAnalysis();
            }
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

        document.addEventListener('mousedown', (e) => {
            const tooltip = document.getElementById('lrr-selection-tooltip');
            if (tooltip && tooltip.contains(e.target)) {
                return;
            }
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
            <button id="lrr-analyze-selection" title="Analyze Legal Risk">✨</button>
        `;
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.top + window.scrollY - 45}px;
            left: ${rect.left + window.scrollX + (rect.width / 2) - 18}px;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const analyzeBtn = tooltip.querySelector('#lrr-analyze-selection');
        analyzeBtn.style.cssText = `
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
            transition: all 0.2s ease;
        `;

        analyzeBtn.addEventListener('mouseenter', () => {
            analyzeBtn.style.transform = 'scale(1.15)';
            analyzeBtn.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.6)';
        });
        analyzeBtn.addEventListener('mouseleave', () => {
            analyzeBtn.style.transform = 'scale(1)';
            analyzeBtn.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.4)';
        });

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
                background: white !important;
                border-radius: 12px !important;
                width: 400px !important;
                max-width: 90vw !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            .lrr-modal-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 20px !important;
                border-bottom: 1px solid #e5e7eb !important;
                background: white !important;
            }
            .lrr-modal-header h3 {
                margin: 0 !important;
                font-size: 18px !important;
                color: #1f2937 !important;
                font-weight: 700 !important;
            }
            .lrr-modal-body {
                padding: 20px !important;
                background: white !important;
                border-bottom-left-radius: 12px !important;
                border-bottom-right-radius: 12px !important;
            }
            .lrr-modal-body p {
                color: #4b5563 !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                margin: 0 0 15px 0 !important;
                text-align: left !important;
            }
            .lrr-quick-actions {
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
                margin-top: 15px !important;
            }
            .lrr-quick-actions button {
                padding: 12px !important;
                border: 1px solid #d1d5db !important;
                border-radius: 8px !important;
                background: white !important;
                color: #374151 !important;
                cursor: pointer !important;
                font-weight: 600 !important;
                transition: all 0.2s !important;
                font-size: 13px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                width: 100% !important;
            }
            .lrr-quick-actions button:hover {
                background: #f9fafb !important;
                border-color: #3b82f6 !important;
                color: #2563eb !important;
            }
            #lrr-close-modal {
                background: none !important;
                border: none !important;
                font-size: 24px !important;
                cursor: pointer !important;
                color: #6b7280 !important;
                padding: 0 !important;
                width: 30px !important;
                height: 30px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
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
                    
                    // Skip extension elements to prevent self-scanning
                    let current = parent;
                    while (current) {
                        if (current.id && (current.id.startsWith('lrr-') || current.id.startsWith('legal-risk-analyzer'))) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        current = current.parentElement;
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
                                    <div class="lrr-clause-text"><strong>${clause.clause_snippet || clause.clause || clause.issue || 'Issue identified'}</strong>: ${clause.explanation || ''}</div>
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
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.5) !important;
                backdrop-filter: blur(4px) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10004 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                animation: lrr-fadeIn 0.3s ease !important;
            }
            
            @keyframes lrr-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .lrr-popup-content {
                background: white !important;
                border-radius: 16px !important;
                width: 90% !important;
                max-width: 500px !important;
                max-height: 80vh !important;
                overflow: hidden !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
                animation: lrr-slideUp 0.3s ease !important;
                color: #1f2937 !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            @keyframes lrr-slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .lrr-popup-header {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
                padding: 20px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            
            .lrr-popup-title {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                color: white !important;
            }
            
            .lrr-popup-icon {
                font-size: 20px !important;
            }
            
            .lrr-close-btn {
                background: none !important;
                border: none !important;
                color: white !important;
                font-size: 24px !important;
                cursor: pointer !important;
                padding: 0 !important;
                width: 30px !important;
                height: 30px !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: background 0.2s !important;
            }
            
            .lrr-close-btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
            }
            
            .lrr-popup-body {
                padding: 20px !important;
                max-height: 60vh !important;
                overflow-y: auto !important;
                background: white !important;
                text-align: left !important;
            }
            
            .lrr-risk-score {
                text-align: center !important;
                margin-bottom: 24px !important;
            }
            
            .lrr-score-circle {
                width: 80px !important;
                height: 80px !important;
                border-radius: 50% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 auto 8px !important;
                border: 4px solid !important;
                font-weight: bold !important;
            }
            
            .lrr-score-circle.low-risk {
                border-color: #10b981 !important;
                background: rgba(16, 185, 129, 0.1) !important;
                color: #10b981 !important;
            }
            
            .lrr-score-circle.medium-risk {
                border-color: #f59e0b !important;
                background: rgba(245, 158, 11, 0.1) !important;
                color: #f59e0b !important;
            }
            
            .lrr-score-circle.high-risk {
                border-color: #ef4444 !important;
                background: rgba(239, 68, 68, 0.1) !important;
                color: #ef4444 !important;
            }
            
            .lrr-score-number {
                font-size: 24px !important;
                line-height: 1 !important;
            }
            
            .lrr-score-label {
                font-size: 12px !important;
                opacity: 0.8 !important;
            }
            
            .lrr-risk-level {
                font-size: 14px !important;
                font-weight: 600 !important;
                color: #6b7280 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            
            .lrr-summary, .lrr-clauses, .lrr-missing {
                margin-bottom: 20px !important;
            }
            
            .lrr-summary h4, .lrr-clauses h4, .lrr-missing h4 {
                margin: 0 0 12px 0 !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                color: #1f2937 !important;
            }
            
            .lrr-summary p {
                margin: 0 !important;
                color: #4b5563 !important;
                line-height: 1.5 !important;
            }
            
            .lrr-clause-item {
                margin-bottom: 12px !important;
                padding: 12px !important;
                border-radius: 8px !important;
                border-left: 4px solid !important;
                text-align: left !important;
            }
            
            .lrr-clause-item.low-risk {
                background: rgba(16, 185, 129, 0.05) !important;
                border-left-color: #10b981 !important;
            }
            
            .lrr-clause-item.medium-risk {
                background: rgba(245, 158, 11, 0.05) !important;
                border-left-color: #f59e0b !important;
            }
            
            .lrr-clause-item.high-risk {
                background: rgba(239, 68, 68, 0.05) !important;
                border-left-color: #ef4444 !important;
            }
            
            .lrr-clause-risk {
                font-size: 12px !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                margin-bottom: 4px !important;
                color: #6b7280 !important;
            }
            
            .lrr-clause-text {
                font-size: 14px !important;
                color: #374151 !important;
                line-height: 1.4 !important;
            }
            
            .lrr-clause-text strong {
                color: #1f2937 !important;
            }
            
            .lrr-more-issues {
                font-size: 12px !important;
                color: #6b7280 !important;
                font-style: italic !important;
                margin: 8px 0 0 0 !important;
            }
            
            .lrr-missing ul {
                margin: 0 !important;
                padding-left: 20px !important;
                color: #4b5563 !important;
                text-align: left !important;
            }
            
            .lrr-missing li {
                margin-bottom: 4px !important;
                font-size: 14px !important;
                color: #4b5563 !important;
            }
            
            .lrr-actions {
                display: flex !important;
                gap: 12px !important;
                margin-top: 24px !important;
                padding-top: 20px !important;
                border-top: 1px solid #e5e7eb !important;
            }
            
            .lrr-btn-primary, .lrr-btn-secondary {
                flex: 1 !important;
                padding: 12px 20px !important;
                border-radius: 8px !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s !important;
                border: none !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .lrr-btn-primary {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                color: white !important;
            }
            
            .lrr-btn-primary:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
            }
            
            .lrr-btn-secondary {
                background: #f9fafb !important;
                color: #374151 !important;
                border: 1px solid #d1d5db !important;
            }
            
            .lrr-btn-secondary:hover {
                background: #f3f4f6 !important;
            }
            
            .lrr-upgrade-note {
                margin-top: 20px !important;
                padding: 16px !important;
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe) !important;
                border: 1px solid #0ea5e9 !important;
                border-radius: 8px !important;
                font-size: 13px !important;
                text-align: left !important;
            }
            
            .lrr-upgrade-note p {
                margin: 0 0 8px 0 !important;
                color: #0c4a6e !important;
                font-weight: 600 !important;
            }
            
            .lrr-upgrade-note ul {
                margin: 0 !important;
                padding-left: 16px !important;
                color: #0369a1 !important;
            }
            
            .lrr-upgrade-note li {
                margin-bottom: 4px !important;
                font-size: 12px !important;
                color: #0369a1 !important;
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