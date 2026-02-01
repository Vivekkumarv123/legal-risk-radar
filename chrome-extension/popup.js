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
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');

    // Check if all elements exist
    if (!analyzeBtn || !openAppBtn || !status || !loading) {
        console.error('Legal Risk Radar: Required DOM elements not found');
        return;
    }

    // Analyze selected text
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

            console.log('Legal Risk Radar: Executing script to get selected text...');

            // Execute script to get selected text
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: getSelectedText
            });
            
            const selectedText = results[0]?.result;
            console.log('Legal Risk Radar: Selected text length:', selectedText?.length || 0);
            
            if (!selectedText || selectedText.trim().length < 20) {
                showStatus('Please select at least 20 characters of text to analyze', 'error');
                return;
            }
            
            console.log('Legal Risk Radar: Making API request...');

            // Send to API for analysis
            const response = await fetch('https://legal-risk-radar.vercel.app/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: selectedText.trim(),
                    source: 'chrome_extension'
                })
            });
            
            console.log('Legal Risk Radar: API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Legal Risk Radar: API error:', errorText);
                throw new Error(`Analysis failed (${response.status}). Please try again.`);
            }
            
            const analysis = await response.json();
            console.log('Legal Risk Radar: Analysis successful');
            
            // Store result
            await chrome.storage.local.set({ 
                lastAnalysis: {
                    ...analysis,
                    timestamp: Date.now()
                }
            });
            
            showStatus('Analysis complete! Check the full app for detailed results.', 'success');
            
        } catch (error) {
            console.error('Legal Risk Radar: Analysis error:', error);
            showStatus(error.message || 'Analysis failed. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    });

    // Open full application
    openAppBtn.addEventListener('click', function() {
        console.log('Legal Risk Radar: Opening full app');
        chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app' });
        window.close();
    });

    // Quick actions
    if (contractCheck) {
        contractCheck.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/private-chat?mode=contract' });
            window.close();
        });
    }

    if (legalGlossary) {
        legalGlossary.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/pricing' });
            window.close();
        });
    }

    if (complianceCheck) {
        complianceCheck.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app/pages/private-chat?mode=compliance' });
            window.close();
        });
    }

    // Utility functions
    function showStatus(message, type) {
        console.log('Legal Risk Radar: Status:', type, message);
        status.innerHTML = `<div class="status ${type}">${message}</div>`;
        setTimeout(() => {
            status.innerHTML = '';
        }, 5000);
    }

    function showLoading(show) {
        if (loading && document.querySelector('.action-buttons')) {
            loading.style.display = show ? 'block' : 'none';
            document.querySelector('.action-buttons').style.display = show ? 'none' : 'block';
        }
    }

    // Load and display last analysis info
    chrome.storage.local.get(['lastAnalysis']).then((result) => {
        if (result.lastAnalysis && result.lastAnalysis.timestamp) {
            const analysisTime = new Date(result.lastAnalysis.timestamp).toLocaleTimeString();
            showStatus(`Last analysis: ${analysisTime}`, 'info');
        }
    }).catch((error) => {
        console.log('Legal Risk Radar: No previous analysis found');
    });

    console.log('Legal Risk Radar: Popup script initialized successfully');
});

// Function to be injected into the page to get selected text
function getSelectedText() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    console.log('Getting selected text, length:', selectedText.length);
    return selectedText;
}