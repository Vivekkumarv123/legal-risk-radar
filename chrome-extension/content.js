// Content script for Legal Risk Radar Chrome Extension

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
            
            // Send message to background script
            chrome.runtime.sendMessage({
                action: 'analyzeText',
                text: text
            }, (response) => {
                if (response.success) {
                    this.showNotification('Analysis complete! Check extension popup for details.', 'success');
                } else {
                    this.showNotification('Analysis failed. Please try again.', 'error');
                }
            });
            
        } catch (error) {
            this.showNotification('Analysis failed. Please try again.', 'error');
            console.error('Analysis error:', error);
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
                        <button id="lrr-open-app">🚀 Open Full App</button>
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
            window.open('https://legal-risk-radar.vercel.app', '_blank');
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
        const pageText = document.body.innerText;
        this.analyzeSelectedText(pageText.substring(0, 5000)); // Limit to first 5000 chars
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
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupContextMenu() {
        // Context menu will be handled by background script
    }
}

// Initialize the extension
new LegalRiskRadarExtension();