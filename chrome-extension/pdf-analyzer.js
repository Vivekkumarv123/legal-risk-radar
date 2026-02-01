// PDF Analyzer - Automatically analyzes PDFs opened in browser
console.log('Legal Risk Radar: PDF Analyzer loaded');

class PDFAnalyzer {
    constructor() {
        this.isAnalyzing = false;
        this.analysisResults = null;
        this.overlay = null;
        this.init();
    }

    init() {
        // Wait for page to load completely
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.detectPDF());
        } else {
            this.detectPDF();
        }
    }

    detectPDF() {
        console.log('Legal Risk Radar: Checking for PDF...');
        
        // Check if current page is a PDF
        const isPDF = this.isPDFPage();
        
        if (isPDF) {
            console.log('Legal Risk Radar: PDF detected, initializing analyzer');
            this.initializePDFAnalyzer();
        }
    }

    isPDFPage() {
        // Check URL for PDF extension
        const url = window.location.href.toLowerCase();
        if (url.includes('.pdf')) return true;
        
        // Check content type
        const contentType = document.contentType || '';
        if (contentType.includes('application/pdf')) return true;
        
        // Check for PDF viewer elements
        const pdfViewers = [
            'embed[type="application/pdf"]',
            'object[type="application/pdf"]',
            'iframe[src*=".pdf"]',
            '#viewer', // Chrome PDF viewer
            '.pdfViewer', // Firefox PDF viewer
            '[data-pdf-viewer]'
        ];
        
        return pdfViewers.some(selector => document.querySelector(selector));
    }

    initializePDFAnalyzer() {
        // Create floating analysis button
        this.createFloatingButton();
        
        // Auto-analyze after a short delay
        setTimeout(() => {
            this.startAutoAnalysis();
        }, 2000);
    }

    createFloatingButton() {
        // Remove existing button if any
        const existingButton = document.getElementById('legal-risk-analyzer-btn');
        if (existingButton) existingButton.remove();

        // Create floating button
        const button = document.createElement('div');
        button.id = 'legal-risk-analyzer-btn';
        button.innerHTML = `
            <div class="analyzer-btn">
                <div class="analyzer-icon">⚖️</div>
                <div class="analyzer-text">Analyze Legal Risk</div>
            </div>
        `;
        
        button.addEventListener('click', () => this.startManualAnalysis());
        document.body.appendChild(button);

        // Create results overlay (hidden initially)
        this.createResultsOverlay();
    }

    createResultsOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'legal-risk-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-header">
                    <div class="overlay-title">
                        <span class="overlay-icon">⚖️</span>
                        Legal Risk Analysis
                    </div>
                    <button class="overlay-close" onclick="this.parentElement.parentElement.parentElement.style.display='none'">×</button>
                </div>
                <div class="overlay-body">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Analyzing PDF for legal risks...</p>
                    </div>
                    <div class="results-state" style="display: none;">
                        <div class="risk-score">
                            <div class="score-circle">
                                <span class="score-number">-</span>
                            </div>
                            <div class="score-label">Risk Score</div>
                        </div>
                        <div class="analysis-summary"></div>
                        <div class="key-risks"></div>
                        <div class="overlay-actions">
                            <button class="btn-primary" onclick="window.open('https://legal-risk-radar.vercel.app', '_blank')">
                                Full Analysis
                            </button>
                            <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    async startAutoAnalysis() {
        if (this.isAnalyzing) return;
        
        console.log('Legal Risk Radar: Starting auto-analysis');
        
        // Show subtle notification
        this.showNotification('Analyzing PDF for legal risks...', 'info');
        
        try {
            const pdfText = await this.extractPDFText();
            if (pdfText && pdfText.length > 100) {
                const analysis = await this.analyzeText(pdfText);
                this.displayQuickResults(analysis);
            }
        } catch (error) {
            console.error('Legal Risk Radar: Auto-analysis failed:', error);
        }
    }

    async startManualAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.showOverlay();
        
        try {
            const pdfText = await this.extractPDFText();
            
            if (!pdfText || pdfText.length < 100) {
                throw new Error('Could not extract sufficient text from PDF');
            }
            
            const analysis = await this.analyzeText(pdfText);
            this.displayDetailedResults(analysis);
            
        } catch (error) {
            console.error('Legal Risk Radar: Analysis failed:', error);
            this.showError(error.message);
        } finally {
            this.isAnalyzing = false;
        }
    }

    async extractPDFText() {
        console.log('Legal Risk Radar: Extracting PDF text...');
        
        // Try different methods to extract text
        let text = '';
        
        // Method 1: Try to get text from PDF.js viewer
        text = this.extractFromPDFJS();
        if (text && text.length > 50) return text.substring(0, 1200); // Limit to 1200 chars
        
        // Method 2: Try to get text from selection
        text = this.extractFromSelection();
        if (text && text.length > 50) return text.substring(0, 1200);
        
        // Method 3: Try to get text from document
        text = this.extractFromDocument();
        if (text && text.length > 50) return text.substring(0, 1200);
        
        // Method 4: Fallback - ask user to select text
        throw new Error('Please select some text from the PDF to analyze (minimum 50 characters)');
    }

    extractFromPDFJS() {
        try {
            // Chrome's built-in PDF viewer
            const textLayers = document.querySelectorAll('.textLayer');
            if (textLayers.length > 0) {
                let text = '';
                textLayers.forEach(layer => {
                    const spans = layer.querySelectorAll('span');
                    spans.forEach(span => {
                        text += span.textContent + ' ';
                    });
                });
                return text.trim();
            }
            
            // Firefox PDF.js viewer
            const pdfPages = document.querySelectorAll('.page');
            if (pdfPages.length > 0) {
                let text = '';
                pdfPages.forEach(page => {
                    text += page.textContent + '\n';
                });
                return text.trim();
            }
        } catch (error) {
            console.log('Legal Risk Radar: PDF.js extraction failed:', error);
        }
        return null;
    }

    extractFromSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        return selectedText.length > 50 ? selectedText : null;
    }

    extractFromDocument() {
        // Get all visible text from the document
        const text = document.body.innerText || document.body.textContent || '';
        return text.length > 50 ? text.substring(0, 1200) : null; // Limit to first 1200 chars
    }

    async analyzeText(text) {
        console.log('Legal Risk Radar: Analyzing text, length:', text.length);
        
        const response = await fetch('https://legal-risk-radar.vercel.app/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text.substring(0, 1200), // Limit text size to 1200 characters
                source: 'chrome_extension_pdf'
            })
        });

        if (!response.ok) {
            throw new Error(`Analysis failed: ${response.status}`);
        }

        const result = await response.json();
        return result.analysis || result;
    }

    displayQuickResults(analysis) {
        // Update floating button with risk indicator and brief message
        const button = document.getElementById('legal-risk-analyzer-btn');
        if (button && analysis.overall_risk_score) {
            const riskScore = parseInt(analysis.overall_risk_score);
            const riskColor = riskScore >= 7 ? '#ef4444' : riskScore >= 4 ? '#f59e0b' : '#10b981';
            
            button.style.borderLeft = `4px solid ${riskColor}`;
            
            // Update button text with brief result
            const analyzerText = button.querySelector('.analyzer-text');
            if (riskScore >= 7) {
                analyzerText.textContent = `⚠️ HIGH RISK (${riskScore}/10) - Click for details`;
            } else if (riskScore >= 4) {
                analyzerText.textContent = `⚡ MEDIUM RISK (${riskScore}/10) - Click for details`;
            } else {
                analyzerText.textContent = `✅ LOW RISK (${riskScore}/10) - Click for details`;
            }
        }
        
        // Show brief notification
        const briefMessage = this.getBriefMessage(analysis);
        this.showNotification(briefMessage, 'info');
        
        this.analysisResults = analysis;
    }

    getBriefMessage(analysis) {
        const riskScore = parseInt(analysis.overall_risk_score || 5);
        
        if (riskScore >= 7) {
            return '⚠️ HIGH RISK detected! Click button for details or open app for full analysis.';
        } else if (riskScore >= 4) {
            return '⚡ MEDIUM RISK found. Click button for summary or open app for detailed review.';
        } else {
            return '✅ LOW RISK detected. Click button for summary or open app for comprehensive analysis.';
        }
    }

    displayDetailedResults(analysis) {
        const overlay = this.overlay;
        const loadingState = overlay.querySelector('.loading-state');
        const resultsState = overlay.querySelector('.results-state');
        
        // Hide loading, show results
        loadingState.style.display = 'none';
        resultsState.style.display = 'block';
        
        // Update risk score
        const riskScore = parseInt(analysis.overall_risk_score || 5);
        const scoreElement = overlay.querySelector('.score-number');
        const scoreCircle = overlay.querySelector('.score-circle');
        
        scoreElement.textContent = riskScore;
        
        // Color code the risk score
        if (riskScore >= 7) {
            scoreCircle.className = 'score-circle high-risk';
        } else if (riskScore >= 4) {
            scoreCircle.className = 'score-circle medium-risk';
        } else {
            scoreCircle.className = 'score-circle low-risk';
        }
        
        // Update summary
        const summaryElement = overlay.querySelector('.analysis-summary');
        summaryElement.innerHTML = `
            <h3>Quick Analysis</h3>
            <p>${analysis.summary || 'Analysis completed successfully.'}</p>
            <div class="app-cta">
                <strong>💡 For detailed analysis:</strong> Open the full Legal Risk Radar app to get comprehensive explanations, missing clause detection, and expert recommendations.
            </div>
        `;
        
        // Update key risks
        const risksElement = overlay.querySelector('.key-risks');
        if (analysis.clauses && analysis.clauses.length > 0) {
            const topRisks = analysis.clauses
                .filter(clause => ['CRITICAL', 'HIGH'].includes(clause.risk_level))
                .slice(0, 3);
            
            risksElement.innerHTML = `
                <h3>Key Risks Found</h3>
                ${topRisks.map(risk => `
                    <div class="risk-item ${risk.risk_level.toLowerCase()}">
                        <div class="risk-level">${risk.risk_level}</div>
                        <div class="risk-text">${risk.explanation}</div>
                    </div>
                `).join('')}
                ${topRisks.length === 0 ? '<p>No critical risks detected in this document.</p>' : ''}
            `;
        }
    }

    showOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
            // Reset to loading state
            this.overlay.querySelector('.loading-state').style.display = 'block';
            this.overlay.querySelector('.results-state').style.display = 'none';
        }
    }

    showError(message) {
        const overlay = this.overlay;
        const loadingState = overlay.querySelector('.loading-state');
        
        loadingState.innerHTML = `
            <div class="error-icon">⚠️</div>
            <p>Analysis failed: ${message}</p>
            <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.style.display='none'">
                Close
            </button>
        `;
    }

    showNotification(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `pdf-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize PDF analyzer when script loads
const pdfAnalyzer = new PDFAnalyzer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzePDF') {
        pdfAnalyzer.startManualAnalysis();
        sendResponse({ success: true });
    } else if (request.action === 'getPDFAnalysis') {
        sendResponse({ 
            success: true, 
            analysis: pdfAnalyzer.analysisResults,
            isPDF: pdfAnalyzer.isPDFPage()
        });
    }
});

console.log('Legal Risk Radar: PDF Analyzer initialized');