# FocusFlow AI Sidebar Debugging Instructions

## 🔍 **CURRENT ISSUE STATUS**

User reports: **"still a tiny black box at pop up"**

Previous fix (Vite asset paths) may not have resolved the issue completely. Need systematic debugging.

---

## 🧪 **SYSTEMATIC DEBUGGING APPROACH**

### **Step 1: Test Debug Page**
1. **Load extension** in Chrome
2. **Navigate to**: `chrome-extension://<ID>/debug-sidebar.html`
3. **Run all tests** in debug page:
   - Extension API availability
   - Asset loading tests
   - Iframe creation test
   - Manual sidebar test (without Shadow DOM)

### **Step 2: Check Console Logs**
Open Chrome DevTools and look for:

**Expected Success Logs:**
```
🔗 SidebarManager: Creating iframe with src: chrome-extension://ID/index.html?mode=sidebar
✅ SidebarManager: Iframe loaded successfully
🚀 FocusFlow AI: Starting React mount
✅ FocusFlow AI: React app mounted successfully
🎯 FocusFlow AI: App component rendering
🔍 SidebarManager: DOM Structure Debug {iframeComputedStyles: {width: "400px", ...}}
```

**Error Logs to Investigate:**
```
❌ SidebarManager: Iframe load error
❌ FocusFlow AI: React mount failed
⏰ SidebarManager: Iframe load timeout
⚠️ SidebarManager: Cannot access iframe content
```

### **Step 3: Manual Sidebar Test**
In debug page, click **"Create Manual Sidebar"** - this creates sidebar WITHOUT Shadow DOM.

If manual sidebar works → Shadow DOM issue.
If manual sidebar also fails → Core iframe/asset issue.

---

## 🔧 **LIKELY REMAINING ISSUES**

### **1. CSP (Content Security Policy) Restrictions**
Check if CSP is blocking:
- Script execution in iframe
- Asset loading from relative paths
- Module loading

**Debug**: Check Console for CSP violations.

### **2. Shadow DOM Encapsulation**
Shadow DOM might be:
- Blocking style inheritance
- Preventing proper layout
- Isolating iframe incorrectly

**Test**: Manual sidebar without Shadow DOM.

### **3. Sandbox Restrictions**
Iframe sandbox attributes might be:
- Too restrictive
- Blocking React mounting
- Preventing proper rendering

**Current sandbox**: `allow-scripts allow-same-origin allow-forms`

### **4. Extension Context Issues**
Chrome extension context might have:
- Different security model
- Asset loading restrictions
- Module execution issues

---

## 📋 **DEBUGGING CHECKLIST**

### **Asset Loading Verification:**
- [ ] `chrome-extension://ID/index.html` loads in browser
- [ ] `chrome-extension://ID/assets/index.css` loads
- [ ] `chrome-extension://ID/assets/index.js` loads
- [ ] No 404 errors in Network tab
- [ ] No CSP violations in Console

### **Iframe Rendering Verification:**
- [ ] Iframe src is correct URL
- [ ] Iframe loads successfully (onload fires)
- [ ] React app mounts inside iframe
- [ ] CSS styles apply correctly
- [ ] Content is visible (not hidden)

### **Layout Verification:**
- [ ] Host element has correct dimensions
- [ ] Iframe has correct dimensions
- [ ] Shadow DOM doesn't collapse layout
- [ ] Transform styles apply correctly
- [ ] No overflow:hidden issues

---

## 🛠️ **QUICK FIXES TO TRY**

### **Fix 1: Remove Shadow DOM**
```javascript
// In SidebarManager.js, temporarily disable Shadow DOM
this.shadowRoot = this.host; // Instead of attachShadow
```

### **Fix 2: Simplify Sandbox**
```javascript
// Remove restrictive sandbox
iframe.setAttribute('sandbox', 'allow-scripts');
```

### **Fix 3: Direct Asset URLs**
```javascript
// Use full extension URLs instead of relative
iframe.src = chrome.runtime.getURL('index.html?mode=sidebar');
// Ensure assets use full URLs in index.html
```

### **Fix 4: CSP Adjustment**
```json
// In manifest.json, relax CSP for testing
"content_security_policy": {
  "extension_pages": "script-src 'self' 'unsafe-inline'; object-src 'self';"
}
```

---

## 🎯 **NEXT STEPS**

1. **Test debug page** - Run all diagnostic tests
2. **Check console logs** - Identify specific failure point
3. **Try manual sidebar** - Isolate Shadow DOM issue
4. **Verify asset URLs** - Ensure correct paths
5. **Test CSP changes** - Rule out security restrictions

---

## 📊 **EXPECTED OUTCOMES**

### **If Debug Page Shows Success:**
- Issue is in production SidebarManager logic
- Need to fix specific component

### **If Debug Page Shows Failures:**
- Issue is fundamental (assets, CSP, extension context)
- Need core architecture fix

### **If Manual Sidebar Works:**
- Shadow DOM is the problem
- Need to fix encapsulation

---

## 🔧 **IMPLEMENTATION PLAN**

After debugging identifies root cause:

1. **Apply specific fix** (Shadow DOM, CSP, assets, etc.)
2. **Test fix thoroughly** across multiple sites
3. **Remove debug code** once stable
4. **Update documentation** with final solution
5. **Verify production deployment** readiness

---

**Status**: 🔍 **DEBUGGING IN PROGRESS**
**Next Action**: Test debug page and identify exact failure point
**Goal**: Full 400px sidebar with React UI rendering correctly
