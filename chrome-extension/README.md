# Legal Risk Radar Chrome Extension

## Installation & Testing

### 1. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension should now appear in your extensions list

### 2. Test the Extension

1. The extension is configured to use the deployed server at `https://legal-risk-radar.vercel.app`
2. Open any webpage or the test page: `chrome-extension://[extension-id]/test.html`
3. Select some text on the page (at least 10 characters)
4. Click the Legal Risk Radar extension icon in the toolbar
5. Click "Analyze Selected Text" in the popup
6. Check the browser console for any errors

### 3. Troubleshooting

#### Extension Not Visible
- Check if the extension is enabled in `chrome://extensions/`
- Look for any error messages in the extensions page
- Try reloading the extension

#### Popup Not Working
- Right-click the extension icon and select "Inspect popup" to see console errors
- Check if all required files are present in the extension folder
- Verify the manifest.json is valid

#### API Errors
- The extension uses the deployed server at `https://legal-risk-radar.vercel.app`
- Check the browser console for network errors
- If requests are pending, check your internet connection

#### Text Selection Issues
- Make sure you're selecting text before clicking the extension
- Try selecting different amounts of text (minimum 10 characters recommended)
- Check the browser console for selection-related errors

### 4. Features

- **Text Analysis**: Select any text on a webpage and get instant legal risk analysis
- **PDF Support**: Analyze PDF documents directly in the browser
- **Quick Actions**: Access different analysis modes and features
- **Integration**: Seamlessly connects to the main Legal Risk Radar application

### 5. Development

#### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # Content script for webpage interaction
├── content.css           # Styles for content script
├── background.js         # Background service worker
├── pdf-analyzer.js       # PDF analysis functionality
├── pdf-overlay.css       # PDF overlay styles
├── test.html            # Test page for development
└── README.md            # This file
```

#### Making Changes
1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Legal Risk Radar extension
4. Test your changes

### 6. Common Issues

**"Permission was denied for this request to access the `loopback` address space"**
- This is a Chrome security feature that blocks requests to localhost from external websites
- The extension automatically uses background script as a fallback
- If server is not accessible, extension provides offline analysis

**"Required Chrome APIs not available"**
- The extension needs to be properly loaded and have the right permissions
- Check the manifest.json permissions

**"Could not access current tab"**
- Make sure you're on a regular webpage (not chrome:// pages)
- Some pages may block extension access

**"Analysis failed (404)"**
- The deployed server may be experiencing issues
- Extension will provide offline analysis as fallback
- Check if `https://legal-risk-radar.vercel.app` is accessible

**Requests stuck in "Pending"**
- Check your internet connection
- The deployed server may be slow to respond
- Extension will timeout and provide offline analysis after 30 seconds

### 7. Production Configuration

The extension is configured to use the deployed server at `https://legal-risk-radar.vercel.app`. This provides:

1. **No CORS Issues**: Works from any website without cross-origin restrictions
2. **Always Available**: No need to run a local server
3. **Full AI Analysis**: Access to the complete Gemini AI analysis
4. **Offline Fallback**: Basic analysis when network is unavailable

The extension automatically handles network issues and provides offline analysis when the server is not reachable.