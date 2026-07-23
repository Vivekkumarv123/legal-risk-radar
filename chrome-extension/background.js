// Legal Risk Radar Chrome Extension - Background Script
console.log('Legal Risk Radar: Background script starting...');

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Legal Risk Radar: Extension installed/updated');
    
    // Create context menus
    createContextMenus();
});

function createContextMenus() {
    try {
        // Remove existing menus first
        chrome.contextMenus.removeAll(() => {
            // Create new menus
            chrome.contextMenus.create({
                id: 'analyzeLegalRisk',
                title: 'Analyze Legal Risk',
                contexts: ['selection']
            });

            chrome.contextMenus.create({
                id: 'analyzePDFRisk',
                title: 'Analyze PDF Legal Risk',
                contexts: ['page'],
                documentUrlPatterns: ['*://*/*.pdf', '*://*/*.pdf?*', '*://*/*.pdf#*']
            });

            chrome.contextMenus.create({
                id: 'openLegalApp',
                title: 'Open Legal Risk Radar',
                contexts: ['page']
            });

            console.log('Legal Risk Radar: Context menus created successfully');
        });
    } catch (error) {
        console.error('Legal Risk Radar: Error creating context menus:', error);
    }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('Legal Risk Radar: Context menu clicked:', info.menuItemId);
    
    if (info.menuItemId === 'analyzeLegalRisk') {
        if (info.selectionText && info.selectionText.trim().length > 0) {
            analyzeSelectedText(info.selectionText, tab.id);
        } else {
            console.log('Legal Risk Radar: No text selected');
        }
    } else if (info.menuItemId === 'analyzePDFRisk') {
        // Trigger PDF analysis
        chrome.tabs.sendMessage(tab.id, { action: 'analyzePDF' }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('Legal Risk Radar: Could not communicate with PDF analyzer');
            }
        });
    } else if (info.menuItemId === 'openLegalApp') {
        chrome.tabs.create({ url: 'https://legal-risk-radar.vercel.app' });
    }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Legal Risk Radar: Message received:', request.action);
    
    if (request.action === 'analyzeText') {
        analyzeText(request.text)
            .then(result => {
                console.log('Legal Risk Radar: Analysis successful');
                sendResponse({ success: true, result });
            })
            .catch(error => {
                console.error('Legal Risk Radar: Analysis failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
});

async function analyzeSelectedText(text, tabId) {
    console.log('Legal Risk Radar: Analyzing selected text...');
    
    try {
        const result = await analyzeText(text);
        
        // Store the result
        await chrome.storage.local.set({
            lastAnalysis: {
                text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                result: result,
                timestamp: Date.now()
            }
        });

        console.log('Legal Risk Radar: Analysis complete, result stored');

        // Try to show notification (optional)
        try {
            if (chrome.notifications && chrome.notifications.create) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzM5NjZGRiIvPgo8cGF0aCBkPSJNMjQgMTJMMjggMjBIMzZMMzAgMjhMMzQgMzZIMjRMMTQgMzZMMTggMjhMMTIgMjBIMjBMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
                    title: 'Legal Analysis Complete',
                    message: 'Click the extension icon to view results'
                });
            }
        } catch (notifError) {
            console.log('Legal Risk Radar: Notifications not available');
        }

    } catch (error) {
        console.error('Legal Risk Radar: Analysis failed:', error);
        
        // Try to show error notification
        try {
            if (chrome.notifications && chrome.notifications.create) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0VGNDQ0NCIvPgo8cGF0aCBkPSJNMzIgMTZMMTYgMzJNMTYgMTZMMzIgMzIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=',
                    title: 'Analysis Failed',
                    message: 'Please try again or check your connection'
                });
            }
        } catch (notifError) {
            console.log('Legal Risk Radar: Notifications not available');
        }
    }
}

async function analyzeText(text) {
    console.log('Legal Risk Radar: Making API call...');
    
    if (!text || text.trim().length < 10) {
        throw new Error('Text too short for analysis (minimum 10 characters)');
    }

    try {
        const response = await fetch('https://legal-risk-radar.vercel.app/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: text.trim(),
                source: 'chrome_extension'
            })
        });

        console.log('Legal Risk Radar: API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Legal Risk Radar: API error response:', errorText);
            
            // Return a fallback analysis if API fails
            if (response.status >= 500 || response.status === 0) {
                console.log('Legal Risk Radar: Server error, returning fallback analysis');
                return createFallbackAnalysis(text);
            }
            
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Legal Risk Radar: API call successful');
        return result;

    } catch (error) {
        console.error('Legal Risk Radar: API call failed:', error);
        
        // If it's a network error, return fallback analysis
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            console.log('Legal Risk Radar: Network error, returning fallback analysis');
            return createFallbackAnalysis(text);
        }
        
        throw new Error(`Analysis failed: ${error.message}`);
    }
}

// Create a fallback analysis when the API is not available
function createFallbackAnalysis(text) {
    const wordCount = text.split(' ').length;
    const hasRiskyTerms = /waive|disclaim|not liable|no warranty|as is|without limitation|sole discretion/i.test(text);
    const hasLegalTerms = /agreement|contract|terms|conditions|liability|damages|breach|terminate/i.test(text);
    
    let riskScore = 3; // Default medium-low risk
    let summary = "Basic analysis completed offline.";
    let clauses = [];
    let missingProtections = [];
    
    if (hasRiskyTerms) {
        riskScore = 7;
        summary = "High-risk terms detected. This text contains clauses that may limit your rights or protections.";
        clauses.push({
            clause: "Risk-limiting language found",
            risk_level: "High",
            issue: "Contains terms that may waive rights or limit liability"
        });
        missingProtections.push("Clear dispute resolution process");
        missingProtections.push("Balanced liability terms");
    } else if (hasLegalTerms) {
        riskScore = 5;
        summary = "Legal document detected with moderate complexity.";
        clauses.push({
            clause: "Standard legal language",
            risk_level: "Medium",
            issue: "Contains legal terms that should be reviewed carefully"
        });
        missingProtections.push("Clear termination procedures");
    } else {
        summary = "Text appears to be general content with low legal risk.";
        clauses.push({
            clause: "General content",
            risk_level: "Low",
            issue: "No significant legal risks identified"
        });
    }
    
    return {
        success: true,
        analysis: {
            overall_risk_score: riskScore,
            summary: summary + " Note: This is an offline analysis. Connect to the server for detailed AI analysis.",
            clauses: clauses,
            missing_protections: missingProtections
        },
        extraction: {
            type: 'TEXT_INPUT',
            source: 'chrome_extension_offline'
        }
    };
}

// Handle extension icon click (when no popup is defined)
chrome.action.onClicked.addListener((tab) => {
    console.log('Legal Risk Radar: Extension icon clicked');
    // Popup will handle this, but this is a fallback
});

// Listen for tab updates to detect PDF pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isPDF = tab.url.toLowerCase().includes('.pdf');
        if (isPDF) {
            console.log('Legal Risk Radar: PDF page detected:', tab.url);
            // PDF analyzer will be injected automatically via content scripts
        }
    }
});

console.log('Legal Risk Radar: Background script loaded successfully');