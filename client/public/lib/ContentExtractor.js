/**
 * ContentExtractor - Advanced Content Extraction for FocusFlow AI
 * 
 * Integrates Mozilla Readability for clean content extraction:
 * - Removes ads, navigation, and clutter
 * - Preserves headings and semantic structure
 * - Extracts images and media information
 * - Preserves code blocks and technical content
 * - Handles different content types (articles, blogs, documentation)
 * - Fallback extraction methods
 * - Metadata extraction
 */

export class ContentExtractor {
  constructor(options = {}) {
    this.options = {
      minContentLength: 200,
      maxContentLength: 50000,
      preserveImages: true,
      preserveCode: true,
      extractMetadata: true,
      fallbackMode: 'auto', // 'auto', 'basic', 'full'
      ...options
    };
    
    this.readability = null;
    this.initializeReadability();
  }

  /**
   * Initialize Mozilla Readability
   */
  initializeReadability() {
    try {
      // Check if Readability is available
      if (typeof window !== 'undefined' && window.readability) {
        this.readability = window.readability;
      } else if (typeof document !== 'undefined') {
        // Try to load Readability script
        this.loadReadabilityScript();
      }
    } catch (error) {
      console.warn('Readability initialization failed:', error);
    }
  }

  /**
   * Load Readability script dynamically
   */
  async loadReadabilityScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.4.4/Readability.js';
      script.onload = () => {
        if (typeof window !== 'undefined' && window.Readability) {
          this.readability = new window.Readability(document.cloneNode(true));
          resolve();
        } else {
          reject(new Error('Readability failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Readability script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Extract content from current page
   * @returns {Object} Extracted content data
   */
  async extractContent() {
    try {
      let result = null;

      // Try Readability first
      if (this.readability) {
        result = await this.extractWithReadability();
      }

      // Fallback to other methods if Readability fails
      if (!result || !result.content || result.content.length < this.options.minContentLength) {
        result = await this.extractWithFallback();
      }

      // Post-process and validate
      if (result) {
        result = this.postProcessContent(result);
        result = this.validateAndCleanContent(result);
      }

      return result || this.createEmptyResult();
    } catch (error) {
      console.error('Content extraction failed:', error);
      return this.createEmptyResult(error);
    }
  }

  /**
   * Extract content using Mozilla Readability
   * @returns {Object} Readability extraction result
   */
  async extractWithReadability() {
    try {
      if (!this.readability) {
        throw new Error('Readability not available');
      }

      // Create a clone of the document for parsing
      const documentClone = document.cloneNode(true);
      const reader = new this.readability.constructor(documentClone);

      if (!reader.isProbablyReaderable()) {
        throw new Error('Content is not readerable');
      }

      const article = reader.parse();

      if (!article || !article.content) {
        throw new Error('Failed to parse article');
      }

      return {
        content: article.content,
        title: article.title || document.title,
        byline: article.byline,
        dir: article.dir,
        lang: article.lang || document.documentElement.lang,
        length: article.textContent?.length || 0,
        excerpt: article.excerpt,
        siteName: article.siteName,
        publishedTime: article.publishedTime,
        method: 'readability'
      };
    } catch (error) {
      console.warn('Readability extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract content using fallback methods
   * @returns {Object} Fallback extraction result
   */
  async extractWithFallback() {
    const methods = [
      () => this.extractMainContent(),
      () => this.extractArticleContent(),
      () => this.extractStructuredContent(),
      () => this.extractBasicContent()
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result && result.content && result.content.length >= this.options.minContentLength) {
          return { ...result, method: 'fallback' };
        }
      } catch (error) {
        console.warn('Fallback method failed:', error);
        continue;
      }
    }

    return null;
  }

  /**
   * Extract main content using common selectors
   */
  extractMainContent() {
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '#content',
      '.post-content',
      '.entry-content',
      '.article-content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const content = this.cleanElement(element);
        if (content.length >= this.options.minContentLength) {
          return {
            content,
            title: document.title,
            method: 'main-selector',
            selector
          };
        }
      }
    }

    throw new Error('Main content extraction failed');
  }

  /**
   * Extract article content
   */
  extractArticleContent() {
    const articles = document.querySelectorAll('article');
    
    for (const article of articles) {
      const content = this.cleanElement(article);
      if (content.length >= this.options.minContentLength) {
        return {
          content,
          title: article.querySelector('h1, h2, h3')?.textContent || document.title,
          method: 'article-element'
        };
      }
    }

    throw new Error('Article content extraction failed');
  }

  /**
   * Extract structured content
   */
  extractStructuredContent() {
    const structure = this.analyzeDocumentStructure();
    
    if (structure.mainContent && structure.mainContent.length >= this.options.minContentLength) {
      return {
        content: structure.mainContent,
        title: structure.title,
        headings: structure.headings,
        method: 'structured',
        structure
      };
    }

    throw new Error('Structured content extraction failed');
  }

  /**
   * Extract basic content (last resort)
   */
  extractBasicContent() {
    // Remove unwanted elements
    const unwantedSelectors = [
      'nav', 'header', 'footer', 'aside', '.sidebar', '.navigation',
      '.menu', '.ads', '.advertisement', '.social', '.comments',
      'script', 'style', 'noscript', 'iframe'
    ];

    const contentClone = document.cloneNode(true);
    
    unwantedSelectors.forEach(selector => {
      const elements = contentClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    const content = this.cleanElement(contentClone.body || contentClone);
    
    if (content.length >= this.options.minContentLength) {
      return {
        content,
        title: document.title,
        method: 'basic'
      };
    }

    throw new Error('Basic content extraction failed');
  }

  /**
   * Clean element content
   * @param {Element} element - Element to clean
   * @returns {string} Cleaned content
   */
  cleanElement(element) {
    if (!element) return '';

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true);
    
    // Remove unwanted attributes
    const unwantedAttrs = ['onclick', 'onload', 'onerror', 'style'];
    unwantedAttrs.forEach(attr => {
      clone.removeAttribute(attr);
    });

    // Process images if enabled
    if (this.options.preserveImages) {
      this.processImages(clone);
    }

    // Process code blocks if enabled
    if (this.options.preserveCode) {
      this.processCodeBlocks(clone);
    }

    // Get text content while preserving some structure
    let content = '';
    
    if (clone.tagName === 'PRE' || clone.tagName === 'CODE') {
      content = clone.textContent || clone.innerText;
    } else {
      content = clone.innerHTML || '';
    }

    // Clean up content
    content = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return content;
  }

  /**
   * Process images in content
   * @param {Element} element - Element to process
   */
  processImages(element) {
    const images = element.querySelectorAll('img');
    
    images.forEach(img => {
      // Preserve important attributes
      if (img.src) {
        img.setAttribute('data-src', img.src);
      }
      if (img.alt) {
        img.setAttribute('data-alt', img.alt);
      }
      if (img.title) {
        img.setAttribute('data-title', img.title);
      }
    });
  }

  /**
   * Process code blocks in content
   * @param {Element} element - Element to process
   */
  processCodeBlocks(element) {
    const codeBlocks = element.querySelectorAll('pre, code, .highlight, .syntaxhighlighter');
    
    codeBlocks.forEach(block => {
      // Preserve code content
      if (block.textContent || block.innerText) {
        block.setAttribute('data-code', block.textContent || block.innerText);
        block.setAttribute('data-language', this.detectCodeLanguage(block));
      }
    });
  }

  /**
   * Detect code language
   * @param {Element} codeBlock - Code block element
   * @returns {string} Detected language
   */
  detectCodeLanguage(codeBlock) {
    // Check for language classes
    const classes = codeBlock.className || '';
    const langMatch = classes.match(/language-(\w+)|\b(\w+)\b/);
    
    if (langMatch) {
      return langMatch[1] || langMatch[2];
    }

    // Check for data attributes
    const dataLang = codeBlock.getAttribute('data-language');
    if (dataLang) {
      return dataLang;
    }

    // Simple detection based on content
    const content = codeBlock.textContent || '';
    if (content.includes('function') || content.includes('const') || content.includes('let')) {
      return 'javascript';
    } else if (content.includes('def ') || content.includes('import ')) {
      return 'python';
    } else if (content.includes('{') && content.includes('}')) {
      return 'json';
    }

    return 'unknown';
  }

  /**
   * Analyze document structure
   * @returns {Object} Document structure analysis
   */
  analyzeDocumentStructure() {
    const headings = [];
    const mainContent = [];
    let currentSection = '';

    // Extract headings and structure
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || '';
      
      headings.push({
        level,
        text,
        id: heading.id || `heading-${index}`,
        element: heading
      });
    });

    // Extract main content areas
    const contentElements = document.querySelectorAll('p, div, section, article');
    
    contentElements.forEach(element => {
      const text = element.textContent?.trim() || '';
      if (text.length > 50) { // Only include substantial content
        mainContent.push(text);
      }
    });

    return {
      title: document.title,
      headings,
      mainContent: mainContent.join('\n\n'),
      elementCount: contentElements.length
    };
  }

  /**
   * Post-process extracted content
   * @param {Object} result - Extraction result
   * @returns {Object} Post-processed result
   */
  postProcessContent(result) {
    if (!result) return result;

    // Add metadata if enabled
    if (this.options.extractMetadata) {
      result.metadata = this.extractMetadata();
    }

    // Add word count
    if (result.content) {
      result.wordCount = result.content.split(/\s+/).filter(word => word.length > 0).length;
      result.charCount = result.content.length;
    }

    // Add extraction timestamp
    result.extractedAt = new Date().toISOString();

    // Add page information
    result.pageInfo = {
      url: window.location.href,
      domain: window.location.hostname,
      path: window.location.pathname,
      referrer: document.referrer
    };

    return result;
  }

  /**
   * Extract page metadata
   * @returns {Object} Page metadata
   */
  extractMetadata() {
    const metadata = {};

    // Basic meta tags
    const getMetaContent = (name) => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    metadata.description = getMetaContent('description');
    metadata.keywords = getMetaContent('keywords');
    metadata.author = getMetaContent('author');
    metadata.published = getMetaContent('article:published_time') || getMetaContent('published_time');
    metadata.modified = getMetaContent('article:modified_time') || getMetaContent('modified_time');

    // Open Graph tags
    const getOGContent = (property) => {
      const meta = document.querySelector(`meta[property="${property}"], meta[property="og:${property}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    metadata.og = {
      title: getOGContent('title'),
      description: getOGContent('description'),
      image: getOGContent('image'),
      type: getOGContent('type'),
      site_name: getOGContent('site_name')
    };

    // Twitter Card tags
    const getTwitterContent = (name) => {
      const meta = document.querySelector(`meta[name="twitter:${name}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    metadata.twitter = {
      card: getTwitterContent('card'),
      title: getTwitterContent('title'),
      description: getTwitterContent('description'),
      image: getTwitterContent('image')
    };

    // Language and encoding
    metadata.language = document.documentElement.lang || document.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content');
    metadata.charset = document.characterSet || document.querySelector('meta[charset]')?.getAttribute('charset');

    return metadata;
  }

  /**
   * Validate and clean content
   * @param {Object} result - Extraction result
   * @returns {Object} Validated and cleaned result
   */
  validateAndCleanContent(result) {
    if (!result || !result.content) {
      return this.createEmptyResult(new Error('No content found'));
    }

    // Content length validation
    if (result.content.length < this.options.minContentLength) {
      return this.createEmptyResult(new Error('Content too short'));
    }

    // Truncate if too long
    if (result.content.length > this.options.maxContentLength) {
      result.content = result.content.substring(0, this.options.maxContentLength);
      result.truncated = true;
    }

    // Clean up content
    result.content = result.content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Ensure we have a title
    if (!result.title || result.title.trim() === '') {
      result.title = document.title || 'Untitled';
    }

    return result;
  }

  /**
   * Create empty result object
   * @param {Error} error - Optional error
   * @returns {Object} Empty result
   */
  createEmptyResult(error = null) {
    return {
      content: '',
      title: document.title || 'Untitled',
      method: 'none',
      error: error?.message,
      extractedAt: new Date().toISOString(),
      pageInfo: {
        url: window.location.href,
        domain: window.location.hostname,
        path: window.location.pathname
      }
    };
  }

  /**
   * Get extraction statistics
   * @returns {Object} Extraction stats
   */
  getStats() {
    return {
      hasReadability: !!this.readability,
      options: this.options,
      documentInfo: {
        title: document.title,
        url: window.location.href,
        wordCount: document.body?.textContent?.split(/\s+/).length || 0
      }
    };
  }

  /**
   * Reset extractor state
   */
  reset() {
    this.readability = null;
    this.initializeReadability();
  }
}

// Export singleton instance
export const contentExtractor = new ContentExtractor();

// Export default
export default ContentExtractor;
