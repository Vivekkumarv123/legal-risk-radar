# Legal Risk Radar Chrome Extension

A powerful Chrome extension that provides instant legal analysis for contracts and documents on any webpage.

## 🚀 Features

- **Right-click Analysis**: Select text on any webpage and analyze it instantly
- **Context Menu Integration**: Quick access to legal analysis tools
- **Background Processing**: Automatic analysis with notifications
- **Production Ready**: Fully integrated with Vercel deployment
- **Cross-Platform**: Works on all websites and platforms

## 📦 Installation

1. **Download Extension Files**
   - Download all files from the `chrome-extension/` folder
   - Ensure you have: `manifest.json`, `popup.html`, `popup.js`, `content.js`, `content.css`, `background.js`

2. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - Extension should appear in your extensions list

3. **Pin Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Legal Risk Radar" and click the pin icon
   - Extension icon will appear in toolbar

## 🎯 How to Use

### Method 1: Right-Click Analysis
1. **Select Text**: Highlight any legal text on a webpage
2. **Right-Click**: Choose "Analyze Legal Risk" from context menu
3. **Get Results**: Analysis runs in background, notification appears when complete
4. **View Details**: Click extension icon to see full results

### Method 2: Extension Popup
1. **Click Extension Icon**: Open the popup interface
2. **Select Text**: Highlight text on the current page
3. **Click Analyze**: Use the "Analyze Selected Text" button
4. **View Results**: Results appear in popup with option to open full app

### Method 3: Quick Actions
- **Contract Check**: Direct link to contract analysis mode
- **Legal Glossary**: Access legal term definitions
- **Compliance Check**: Quick compliance analysis
- **Open Full App**: Launch the complete web application

## 🔧 Technical Details

### Permissions Required
- `activeTab`: Access current tab content
- `storage`: Store analysis results locally
- `contextMenus`: Add right-click menu options
- `alarms`: Periodic cleanup of stored data
- `notifications`: Show analysis completion alerts

### API Integration
- **Production Endpoint**: `https://legal-risk-radar.vercel.app/api/analyze`
- **Authentication**: Chrome extension requests bypass authentication for basic analysis
- **Rate Limiting**: Reasonable use policy applies
- **Data Storage**: Results stored locally in Chrome storage

### Files Structure
```
chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js          # Popup functionality
├── content.js        # Page content interaction
├── content.css       # Styling for injected elements
├── background.js     # Background service worker
└── README.md         # This documentation
```

## 🌐 Production Configuration

The extension is configured to work with the production deployment:

- **Main App**: `https://legal-risk-radar.vercel.app`
- **API Endpoint**: `https://legal-risk-radar.vercel.app/api/analyze`
- **Host Permissions**: Includes both localhost (development) and Vercel (production)

## 🔒 Privacy & Security

- **Local Storage**: Analysis results stored locally in your browser
- **No Personal Data**: Extension doesn't collect personal information
- **Secure API**: All communication encrypted via HTTPS
- **Automatic Cleanup**: Old analysis results automatically removed after 7 days

## 🐛 Troubleshooting

### Common Issues

1. **Extension Won't Load**
   - Ensure all files are in the same folder
   - Check that manifest.json is valid
   - Try reloading the extension in chrome://extensions/

2. **Analysis Not Working**
   - Check internet connection
   - Ensure text is selected before right-clicking
   - Try refreshing the webpage and extension

3. **No Notifications**
   - Check Chrome notification settings
   - Ensure notifications are enabled for extensions
   - Try clicking the extension icon to see results

4. **Service Worker Errors**
   - Go to chrome://extensions/
   - Click "Details" on Legal Risk Radar
   - Check "Inspect views: service worker" for errors
   - Reload extension if needed

### Error Messages

- **"Text too short for analysis"**: Select more text (minimum 20 characters)
- **"Analysis request failed"**: Check internet connection and try again
- **"Processing failed"**: Server issue, try again in a few minutes

## 🔄 Updates

The extension automatically works with the latest version of the web application. No manual updates required for API compatibility.

## 📞 Support

For issues or questions:
- **Web App**: Visit https://legal-risk-radar.vercel.app
- **Email**: Contact through the web application
- **Documentation**: Check the main project README

## ⚠️ Legal Disclaimer

This extension provides legal risk analysis for educational purposes only. It does not constitute legal advice. Always consult qualified legal professionals for important legal decisions.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Compatible**: Chrome 88+ (Manifest V3)