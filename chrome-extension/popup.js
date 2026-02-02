// Legal Risk Radar Chrome Extension - Popup Script
console.log('Legal Risk Radar: Popup script loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Legal Risk Radar: Popup DOM loaded');
    
    // Get DOM elements
    const analyzeBtn = document.getElementById('analyzeBtn');
    const openAppBtn = document.getElementById('openAppBtn');
    const contractCheck = document.getElementById('contractCheck');
    const legalGlossary = document.getElementById('legalGlossary');
    const complianceCheck = document.getElementById('complianceCheck');
    const voiceAnalysis = document.getElementById('voiceAnalysis');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');

    // Check if all elements exist
    if (!analyzeBtn || !openAppBtn || !status || !loading) {
        console.error('Legal Risk Radar: Required DOM elements not found');
        return;
    }

    // Check if current tab is a PDF
    checkForPDF();

    // Analyze selected text or PDF
    analyzeBtn.addEventListener('click', async function() {
        console.log('Legal Risk Radar: Analyze button clicked');
        showLoading(true);
        
        try {
            // Check if required APIs are available
            if (!chrome.tabs || !chrome.scripting) {
                throw new Error('Required Chrome APIs not available. Please reload the extension.');
            }

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('Could not access current tab');
            }

            // Check if it's a PDF page
            const isPDF = await checkIfPDFPage(tab.id);
            
            if (isPDF) {
                // Handle PDF analysis
                await handlePDFAnalysis(tab.id);
            } else {
                // Handle regular text analysis
                await handleTextAnalysis(tab.id);
            }
            
        } catch (error) {
            console.error('Legal Risk Radar: Analysis error:', error);
            showStatus(error.message || 'Analysis failed. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    });

    async function checkIfPDFPage(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                function: () => {
                    const url = window.location.href.toLowerCase();
                    const contentType = document.contentType || '';
                    return url.includes('.pdf') || contentType.includes('application/pdf');
                }
            });
            return results[0]?.result || false;
        } catch (error) {
            return false;
        }
    }

    async function handlePDFAnalysis(tabId) {
        console.log('Legal Risk Radar: Handling PDF analysis');
        
        // Send message to PDF analyzer
        const response = await chrome.tabs.sendMessage(tabId, { action: 'analyzePDF' });
        
        if (response && response.success) {
            showStatus('PDF analysis started! Check the overlay on the page.', 'success');
            // Close popup after a delay
            setTimeout(() => window.close(), 2000);
        } else {
            throw new Error('Could not start PDF analysis. Please try selecting text manually.');
        }
    }

    async function handleTextAnalysis(tabId) {
        console.log('Legal Risk Radar: Executing script to get selected text...');

        try {
            // Execute script to get selected text
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                function: getSelectedText
            });
            
            const selectedText = results[0]?.result;
            console.log('Legal Risk Radar: Selected text length:', selectedText?.length || 0);
            
            if (!selectedText || selectedText.trim().length < 10) {
                showStatus('Please select some text to analyze (at least 10 characters)', 'error');
                return;
            }
            
            if (selectedText.trim().length < 50) {
                showStatus('For better analysis, select at least 50 characters of text', 'info');
            }
            
            console.log('Legal Risk Radar: Using background script for analysis...');

            // Use background script instead of direct fetch to avoid loopback restrictions
            const analysis = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'analyzeText',
                    text: selectedText.trim()
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
            
            console.log('Legal Risk Radar: Analysis successful');
            
            // Store result
            await chrome.storage.local.set({ 
                lastAnalysis: {
                    ...analysis,
                    timestamp: Date.now()
                }
            });
            
            // Show brief result with app promotion
            const riskScore = analysis.analysis?.overall_risk_score || 'N/A';
            const briefResult = getBriefAnalysisMessage(analysis.analysis);
            showStatus(`${briefResult} Register for detailed analysis and advanced features!`, 'success');
            
        } catch (error) {
            console.error('Legal Risk Radar: Text analysis error:', error);
            throw error;
        }
    }

    async function checkForPDF() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) return;

            const isPDF = await checkIfPDFPage(tab.id);
            
            if (isPDF) {
                // Update UI for PDF mode
                analyzeBtn.innerHTML = `
                    <span class="icon">📄</span>
                    Analyze PDF Document
                `;
                
                showStatus('PDF detected! Click to analyze the entire document.', 'info');
                
                // Check if PDF has already been analyzed
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPDFAnalysis' });
                if (response && response.analysis) {
                    const riskScore = response.analysis.overall_risk_score || 'N/A';
                    showStatus(`PDF analyzed! Risk Score: ${riskScore}/10`, 'success');
                }
            }
        } catch (error) {
            console.log('Legal Risk Radar: Could not check for PDF:', error);
        }
    }

    // Open full application
    openAppBtn.addEventListener('click', function() {
        console.log('Legal Risk Radar: Opening registration page');
        const confirmMessage = `Get the most out of Legal Risk Radar!\n\nRegister for free to unlock:\n• Advanced AI analysis\n• Detailed risk reports\n• Document comparison\n• Legal recommendations\n• Save & share analyses\n\nContinue to registration?`;
        
        if (confirm(confirmMessage)) {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/signup' });
        }
        window.close();
    });

    // Quick actions
    if (contractCheck) {
        contractCheck.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/signup?feature=contract' });
            window.close();
        });
    }

    if (legalGlossary) {
        legalGlossary.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/signup?feature=glossary' });
            window.close();
        });
    }

    if (complianceCheck) {
        complianceCheck.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/signup?feature=compliance' });
            window.close();
        });
    }

    if (voiceAnalysis) {
        voiceAnalysis.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/signup?feature=voice' });
            window.close();
        });
    }

    // Utility functions
    function showStatus(message, type) {
        console.log('Legal Risk Radar: Status:', type, message);
        status.innerHTML = `<div class="status ${type}">${message}</div>`;
        
        // Auto-hide status after 5 seconds, except for success messages
        if (type !== 'success') {
            setTimeout(() => {
                if (status.innerHTML.includes(message)) {
                    status.innerHTML = '';
                }
            }, 5000);
        }
    }

    function showLoading(show) {
        if (loading && document.querySelector('.action-buttons')) {
            loading.style.display = show ? 'block' : 'none';
            document.querySelector('.action-buttons').style.display = show ? 'none' : 'flex';
            document.querySelector('.quick-actions').style.display = show ? 'none' : 'grid';
        }
    }

    // Load and display last analysis info
    chrome.storage.local.get(['lastAnalysis']).then((result) => {
        if (result.lastAnalysis && result.lastAnalysis.timestamp) {
            const analysisTime = new Date(result.lastAnalysis.timestamp).toLocaleTimeString();
            showStatus(`Last analysis: ${analysisTime}`, 'info');
        } else {
            // Show welcome message for first-time users
            showStatus('Select text on any webpage, then click Analyze', 'info');
        }
    }).catch((error) => {
        console.log('Legal Risk Radar: No previous analysis found');
        showStatus('Ready to analyze legal text!', 'info');
    });

    console.log('Legal Risk Radar: Popup script initialized successfully');
});

// Get brief analysis message based on risk score
function getBriefAnalysisMessage(analysis) {
    if (!analysis || !analysis.overall_risk_score) {
        return '✅ Analysis complete!';
    }
    
    const riskScore = parseInt(analysis.overall_risk_score);
    
    if (riskScore >= 7) {
        return `⚠️ HIGH RISK (${riskScore}/10) detected!`;
    } else if (riskScore >= 4) {
        return `⚡ MEDIUM RISK (${riskScore}/10) found.`;
    } else {
        return `✅ LOW RISK (${riskScore}/10) detected.`;
    }
}

// Function to be injected into the page to get selected text
function getSelectedText() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    console.log('Getting selected text, length:', selectedText.length);
    return selectedText;
}