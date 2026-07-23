# 🔄 Extension Update Instructions

## The "View Full Analysis" button should now show "🚀 Get Full Analysis - Register Free"

If you're still seeing the old "View Full Analysis" button, please follow these steps:

### 1. Force Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Legal Risk Radar"
3. Click the **refresh/reload icon** (🔄)
4. The version should now show **1.2.0**

### 2. Clear Browser Cache (if needed)
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cached images and files"
3. Click "Clear data"

### 3. Test the Updated Extension
1. Go to any webpage (Gmail, news sites, etc.)
2. Select some legal text
3. Click the floating ⚖️ button or extension icon
4. The analysis popup should now show:
   - Button text: "🚀 Get Full Analysis - Register Free"
   - Upgrade benefits section
   - Registration confirmation dialog when clicked

### 4. Verify Console Logs
1. Right-click on any webpage → "Inspect" → "Console"
2. You should see: `Legal Risk Radar Content Script v2.0 - Registration Flow Loaded`
3. When analyzing text, you should see: `Legal Risk Radar: Creating analysis popup with registration flow`

### 5. If Still Not Working
1. **Remove and Re-add Extension**:
   - Go to `chrome://extensions/`
   - Click "Remove" on Legal Risk Radar
   - Click "Load unpacked" and select the chrome-extension folder again

2. **Check for Multiple Versions**:
   - Make sure there's only one "Legal Risk Radar" extension installed
   - Disable any duplicate extensions

### Expected Behavior After Update:
- ✅ Button shows "🚀 Get Full Analysis - Register Free"
- ✅ Clicking shows registration benefits dialog
- ✅ Confirming redirects to `https://legal-risk-radar.vercel.app/pages/signup`
- ✅ All quick actions redirect to signup page
- ✅ No more localhost URLs

The extension should now properly promote registration instead of trying to access localhost!