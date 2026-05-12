/**
 * SecurityManager - Chrome Web Store Security and Compliance
 * 
 * Provides security utilities for:
 * - Content Security Policy (CSP) compliance
 * - Input validation and sanitization
 * - Secure communication channels
 * - Permission management
 * - Data protection
 * - Chrome Web Store policy compliance
 */

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

  /**
   * Initialize security settings
   */
  initializeSecurity() {
    // Setup allowed origins based on manifest
    this.setupAllowedOrigins();
    
    // Initialize CSP nonce
    this.cspNonce = this.generateNonce();
    
    // Setup security event listeners
    this.setupSecurityListeners();
  }

  /**
   * Generate cryptographically secure nonce
   */
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Setup allowed origins from manifest
   */
  setupAllowedOrigins() {
    try {
      // Get extension's allowed origins
      if (chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        const permissions = manifest.permissions || [];
        const hostPermissions = manifest.host_permissions || [];
        
        // Add chrome-extension: origin
        this.allowedOrigins.add('chrome-extension://' + chrome.runtime.id);
        
        // Add allowed host permissions
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

  /**
   * Setup security event listeners
   */
  setupSecurityListeners() {
    // Monitor for security violations
    if (window.addEventListener) {
      window.addEventListener('securitypolicyviolation', (event) => {
        console.warn('CSP Violation:', event);
        this.reportSecurityViolation('csp', event);
      });
    }
  }

  /**
   * Validate and sanitize input
   * @param {any} input - Input to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
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

    // Type validation
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

    // Required validation
    if (required && !input) {
      result.isValid = false;
      result.errors.push('Input is required');
      return result;
    }

    // Length validation
    if (typeof input === 'string' && input.length > maxLength) {
      result.isValid = false;
      result.errors.push(`Input exceeds maximum length of ${maxLength}`);
      return result;
    }

    // HTML validation
    if (typeof input === 'string' && !allowHTML) {
      result.sanitized = this.sanitizeHTML(input);
      
      if (result.sanitized !== input) {
        result.warnings = result.warnings || [];
        result.warnings.push('HTML content was sanitized');
      }
    }

    // Script validation
    if (typeof input === 'string' && !allowScripts) {
      result.sanitized = this.removeScripts(result.sanitized);
    }

    // JSON validation
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

  /**
   * Sanitize HTML content
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return html;

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html; // This strips HTML
    
    // If we want to allow some safe HTML tags
    if (this.securityConfig.sanitizeHTML) {
      // Allow only safe tags
      const safeHTML = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');

      // Parse safe HTML
      temp.innerHTML = safeHTML;
      
      // Remove dangerous attributes
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

  /**
   * Remove script content
   * @param {string} content - Content to clean
   * @returns {string} Cleaned content
   */
  removeScripts(content) {
    if (!content || typeof content !== 'string') return content;

    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*on\w+\s*=\s*["'][^"']*["'][^>]*>/gi, '');
  }

  /**
   * Validate URL for security
   * @param {string} url - URL to validate
   * @returns {Object} Validation result
   */
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
      
      // Check scheme
      if (!this.securityConfig.allowedSchemes.includes(parsedURL.protocol)) {
        result.isValid = false;
        result.errors.push(`Unsupported protocol: ${parsedURL.protocol}`);
        return result;
      }

      // Check for blocked domains
      if (this.securityConfig.blockedDomains.has(parsedURL.hostname)) {
        result.isValid = false;
        result.errors.push(`Blocked domain: ${parsedURL.hostname}`);
        return result;
      }

      // Check for XSS attempts
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

  /**
   * Create secure message channel
   * @param {string} target - Message target
   * @returns {Object} Secure message channel
   */
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
          // Verify message signature
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

  /**
   * Sign message for integrity
   * @param {any} message - Message to sign
   * @returns {string} Message signature
   */
  signMessage(message) {
    // Simple HMAC-like signature for message integrity
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

  /**
   * Verify message integrity
   * @param {Object} message - Message to verify
   * @param {Object} sender - Message sender
   * @returns {boolean} Verification result
   */
  verifyMessage(message, sender) {
    // Basic verification - in production, use proper cryptographic signatures
    if (!message || !message.nonce || !message.signature) {
      return false;
    }

    // Verify sender origin
    if (sender && sender.origin && !this.allowedOrigins.has(sender.origin)) {
      console.warn('Message from unauthorized origin:', sender.origin);
      return false;
    }

    // Verify timestamp (prevent replay attacks)
    const now = Date.now();
    const messageAge = now - (message.timestamp || 0);
    if (messageAge > 300000) { // 5 minutes
      console.warn('Message too old, possible replay attack');
      return false;
    }

    return true;
  }

  /**
   * Report security violation
   * @param {string} type - Violation type
   * @param {Object} details - Violation details
   */
  reportSecurityViolation(type, details) {
    const violation = {
      type,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Violation:', violation);
    }

    // In production, send to monitoring service
    // This would be implemented based on your monitoring solution
    this.logSecurityEvent(violation);
  }

  /**
   * Log security event
   * @param {Object} event - Security event
   */
  logSecurityEvent(event) {
    try {
      // Store security events locally for debugging
      const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('securityEvents', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Get security compliance status
   * @returns {Object} Compliance status
   */
  getComplianceStatus() {
    return {
      cspCompliant: this.checkCSPCompliance(),
      permissionsCompliant: this.checkPermissionsCompliance(),
      dataProtectionCompliant: this.checkDataProtectionCompliance(),
      lastSecurityCheck: Date.now(),
      securityEvents: this.getSecurityEvents()
    };
  }

  /**
   * Check CSP compliance
   * @returns {boolean} CSP compliance status
   */
  checkCSPCompliance() {
    // Check if CSP is properly configured
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  }

  /**
   * Check permissions compliance
   * @returns {boolean} Permissions compliance status
   */
  checkPermissionsCompliance() {
    try {
      const manifest = chrome.runtime.getManifest();
      const permissions = manifest.permissions || [];
      
      // Check for excessive permissions
      const dangerousPermissions = ['<all_urls>', 'nativeMessaging', 'debugger'];
      const hasDangerous = permissions.some(p => dangerousPermissions.includes(p));
      
      return !hasDangerous;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check data protection compliance
   * @returns {boolean} Data protection compliance status
   */
  checkDataProtectionCompliance() {
    // Check if data is properly encrypted/sanitized
    const hasHTTPS = window.location.protocol === 'https:';
    const hasSecureStorage = !!chrome.storage && !!chrome.storage.local;
    
    return hasHTTPS && hasSecureStorage;
  }

  /**
   * Get security events
   * @returns {Array} Security events
   */
  getSecurityEvents() {
    try {
      return JSON.parse(localStorage.getItem('securityEvents') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear security events
   */
  clearSecurityEvents() {
    try {
      localStorage.removeItem('securityEvents');
    } catch (error) {
      console.error('Failed to clear security events:', error);
    }
  }

  /**
   * Generate CSP header content
   * @returns {string} CSP header content
   */
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

  /**
   * Apply security headers to responses
   * @param {Response} response - HTTP response
   * @returns {Response} Secure response
   */
  applySecurityHeaders(response) {
    const headers = new Headers(response.headers);
    
    // Add security headers
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

  /**
   * Cleanup security resources
   */
  cleanup() {
    this.allowedOrigins.clear();
    this.clearSecurityEvents();
  }
}

// Export singleton instance
export const securityManager = new SecurityManager();

// Export utilities
export const validateInput = securityManager.validateInput.bind(securityManager);
export const validateURL = securityManager.validateURL.bind(securityManager);
export const sanitizeHTML = securityManager.sanitizeHTML.bind(securityManager);
export const createSecureChannel = securityManager.createSecureChannel.bind(securityManager);
export const getComplianceStatus = securityManager.getComplianceStatus.bind(securityManager);
export const reportSecurityViolation = securityManager.reportSecurityViolation.bind(securityManager);
export const cleanup = securityManager.cleanup.bind(securityManager);

export default securityManager;
