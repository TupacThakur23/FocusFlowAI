

export class SecurityManager {
  constructor() {
    this.allowedOrigins = new Set();
    this.cspNonce = this.generateNonce();
    this.securityConfig = {
      maxInputLength: 10000,
      allowedSchemes: ['https:', 'http:', 'chrome-extension:'],
      blockedDomains: new Set(),
      sanitizeHTML: true,
      validateJSON: true
    };
    
    this.initializeSecurity();
  }

  
  initializeSecurity() {

    this.setupAllowedOrigins();
    

    this.cspNonce = this.generateNonce();
    

    this.setupSecurityListeners();
  }

  
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  
  setupAllowedOrigins() {
    try {

      if (chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        const permissions = manifest.permissions || [];
        const hostPermissions = manifest.host_permissions || [];
        

        this.allowedOrigins.add('chrome-extension://' + chrome.runtime.id);
        

        hostPermissions.forEach(permission => {
          if (typeof permission === 'string') {
            this.allowedOrigins.add(permission);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to setup allowed origins:', error);
    }
  }

  
  setupSecurityListeners() {

    if (window.addEventListener) {
      window.addEventListener('securitypolicyviolation', (event) => {
        console.warn('CSP Violation:', event);
        this.reportSecurityViolation('csp', event);
      });
    }
  }

  
  validateInput(input, options = {}) {
    const {
      type = 'string',
      maxLength = this.securityConfig.maxInputLength,
      allowHTML = false,
      allowScripts = false,
      required = false
    } = options;

    const result = {
      isValid: true,
      errors: [],
      sanitized: input
    };

    if (type === 'string' && typeof input !== 'string') {
      result.isValid = false;
      result.errors.push('Input must be a string');
      return result;
    }

    if (type === 'object' && typeof input !== 'object') {
      result.isValid = false;
      result.errors.push('Input must be an object');
      return result;
    }

    if (required && !input) {
      result.isValid = false;
      result.errors.push('Input is required');
      return result;
    }

    if (typeof input === 'string' && input.length > maxLength) {
      result.isValid = false;
      result.errors.push(`Input exceeds maximum length of ${maxLength}`);
      return result;
    }

    if (typeof input === 'string' && !allowHTML) {
      result.sanitized = this.sanitizeHTML(input);
      
      if (result.sanitized !== input) {
        result.warnings = result.warnings || [];
        result.warnings.push('HTML content was sanitized');
      }
    }

    if (typeof input === 'string' && !allowScripts) {
      result.sanitized = this.removeScripts(result.sanitized);
    }

    if (type === 'object' && this.securityConfig.validateJSON) {
      try {
        JSON.stringify(input);
      } catch (error) {
        result.isValid = false;
        result.errors.push('Invalid JSON format');
      }
    }

    return result;
  }

  
  sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return html;

    const temp = document.createElement('div');
    temp.textContent = html; // This strips HTML
    

    if (this.securityConfig.sanitizeHTML) {

      const safeHTML = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');

      temp.innerHTML = safeHTML;
      

      const elements = temp.querySelectorAll('*');
      elements.forEach(element => {
        const attributes = element.attributes;
        for (let i = attributes.length - 1; i >= 0; i--) {
          const attr = attributes[i];
          if (attr.name.toLowerCase().startsWith('on') || 
              attr.name.toLowerCase() === 'style') {
            element.removeAttribute(attr.name);
          }
        }
      });

      return temp.innerHTML;
    }

    return temp.textContent;
  }

  
  removeScripts(content) {
    if (!content || typeof content !== 'string') return content;

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, '');
  }

  
  validateURL(url) {
    const result = {
      isValid: true,
      errors: [],
      sanitized: url
    };

    if (!url || typeof url !== 'string') {
      result.isValid = false;
      result.errors.push('Invalid URL format');
      return result;
    }

    try {
      const parsedURL = new URL(url);
      

      if (!this.securityConfig.allowedSchemes.includes(parsedURL.protocol)) {
        result.isValid = false;
        result.errors.push(`Unsupported protocol: ${parsedURL.protocol}`);
        return result;
      }

      if (this.securityConfig.blockedDomains.has(parsedURL.hostname)) {
        result.isValid = false;
        result.errors.push(`Blocked domain: ${parsedURL.hostname}`);
        return result;
      }

      if (url.toLowerCase().includes('javascript:') || 
          url.toLowerCase().includes('data:') ||
          url.toLowerCase().includes('vbscript:')) {
        result.isValid = false;
        result.errors.push('Potentially dangerous URL detected');
        return result;
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push('Invalid URL format');
    }

    return result;
  }

  
  createSecureChannel(target) {
    const channel = {
      target,
      nonce: this.generateNonce(),
      messages: new Map(),
      
      send: (message) => {
        const secureMessage = {
          data: message,
          nonce: channel.nonce,
          timestamp: Date.now(),
          signature: this.signMessage(message)
        };

        if (target === 'background') {
          return chrome.runtime.sendMessage(secureMessage);
        } else if (target.startsWith('tab-')) {
          const tabId = parseInt(target.replace('tab-', ''));
          return chrome.tabs.sendMessage(tabId, secureMessage);
        }
      },

      receive: (callback) => {
        const handler = (message, sender, sendResponse) => {

          if (this.verifyMessage(message, sender)) {
            callback(message.data, sender, sendResponse);
          }
        };

        if (target === 'background') {
          chrome.runtime.onMessage.addListener(handler);
        } else {
          chrome.runtime.onMessage.addListener(handler);
        }

        return handler;
      }
    };

    return channel;
  }

  
  signMessage(message) {

    const messageString = JSON.stringify(message);
    const key = this.cspNonce;
    
    let hash = 0;
    for (let i = 0; i < messageString.length; i++) {
      const char = messageString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return btoa(hash.toString() + key);
  }

  
  verifyMessage(message, sender) {

    if (!message || !message.nonce || !message.signature) {
      return false;
    }

    if (sender && sender.origin && !this.allowedOrigins.has(sender.origin)) {
      console.warn('Message from unauthorized origin:', sender.origin);
      return false;
    }

    const now = Date.now();
    const messageAge = now - (message.timestamp || 0);
    if (messageAge > 300000) { // 5 minutes
      console.warn('Message too old, possible replay attack');
      return false;
    }

    return true;
  }

  
  reportSecurityViolation(type, details) {
    const violation = {
      type,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Violation:', violation);
    }

    this.logSecurityEvent(violation);
  }

  
  logSecurityEvent(event) {
    try {

      const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
      events.push(event);
      

      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('securityEvents', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  
  getComplianceStatus() {
    return {
      cspCompliant: this.checkCSPCompliance(),
      permissionsCompliant: this.checkPermissionsCompliance(),
      dataProtectionCompliant: this.checkDataProtectionCompliance(),
      lastSecurityCheck: Date.now(),
      securityEvents: this.getSecurityEvents()
    };
  }

  
  checkCSPCompliance() {

    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  }

  
  checkPermissionsCompliance() {
    try {
      const manifest = chrome.runtime.getManifest();
      const permissions = manifest.permissions || [];
      

      const dangerousPermissions = ['<all_urls>', 'nativeMessaging', 'debugger'];
      const hasDangerous = permissions.some(p => dangerousPermissions.includes(p));
      
      return !hasDangerous;
    } catch (error) {
      return false;
    }
  }

  
  checkDataProtectionCompliance() {

    const hasHTTPS = window.location.protocol === 'https:';
    const hasSecureStorage = !!chrome.storage && !!chrome.storage.local;
    
    return hasHTTPS && hasSecureStorage;
  }

  
  getSecurityEvents() {
    try {
      return JSON.parse(localStorage.getItem('securityEvents') || '[]');
    } catch (error) {
      return [];
    }
  }

  
  clearSecurityEvents() {
    try {
      localStorage.removeItem('securityEvents');
    } catch (error) {
      console.error('Failed to clear security events:', error);
    }
  }

  
  generateCSPHeader() {
    const directives = [
      `default-src 'self' 'nonce-${this.cspNonce}'`,
      `script-src 'self' 'nonce-${this.cspNonce}'`,
      `style-src 'self' 'nonce-${this.cspNonce}' https://fonts.googleapis.com`,
      `img-src 'self' data: https:`,
      `connect-src 'self' https://api.example.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `object-src 'none'`,
      `media-src 'self' https:`,
      `frame-src 'self'`,
      `child-src 'self'`,
      `worker-src 'self'`,
      `manifest-src 'self'`,
      `upgrade-insecure-requests`
    ];

    return directives.join('; ');
  }

  
  applySecurityHeaders(response) {
    const headers = new Headers(response.headers);
    

    headers.set('Content-Security-Policy', this.generateCSPHeader());
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  
  cleanup() {
    this.allowedOrigins.clear();
    this.clearSecurityEvents();
  }
}

export const securityManager = new SecurityManager();

export const validateInput = securityManager.validateInput.bind(securityManager);
export const validateURL = securityManager.validateURL.bind(securityManager);
export const sanitizeHTML = securityManager.sanitizeHTML.bind(securityManager);
export const createSecureChannel = securityManager.createSecureChannel.bind(securityManager);
export const getComplianceStatus = securityManager.getComplianceStatus.bind(securityManager);
export const reportSecurityViolation = securityManager.reportSecurityViolation.bind(securityManager);
export const cleanup = securityManager.cleanup.bind(securityManager);

export default securityManager;
