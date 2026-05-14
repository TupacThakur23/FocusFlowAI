export class ContentExtractor {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * CRITICAL ISSUE 2: Fast Timeout (5s)
   */
  async extractWithTimeout(timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;

    return Promise.race([
      this.extractContent(signal),
      new Promise((resolve) => setTimeout(() => {
        controller.abort();
        resolve(this._getFallbackContent('Timeout exceeded (5s)'));
      }, timeout))
    ]);
  }

  async extractContent(signal) {
    try {
      // CRITICAL ISSUE 4: Cancellation Guards
      if (signal?.aborted) return this._getFallbackContent('Aborted before start');

      const clone = document.cloneNode(true);
      
      const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'footer',
        'aside', '.sidebar', '#sidebar', '.menu', '#menu', '.ad', '.ads', '.advertisement',
        '[role="banner"]', '[role="navigation"]', '[role="contentinfo"]', '.comments',
        '.cookie-banner', '#cookie-notice', '.newsletter-overlay', '.popup-newsletter',
        '.share-buttons', '.social-sidebar', '.newsletter-signup'
      ];
      
      unwantedSelectors.forEach(selector => {
        try {
          clone.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) {}
      });

      if (signal?.aborted) return this._getFallbackContent('Aborted during cleaning');

      // Find primary content node
      let primaryNode = null;
      const primarySelectors = ['article', 'main', '[role="main"]', '.content', '#content', '#main', '.post', '.entry'];
      
      for (const sel of primarySelectors) {
        try {
          const el = clone.querySelector(sel);
          if (el && el.textContent.trim().length > 250) {
            primaryNode = el;
            break;
          }
        } catch (e) {}
      }

      if (!primaryNode) primaryNode = clone.body || clone;

      // Semantic extraction
      let extractedText = this._processNode(primaryNode);

      if (signal?.aborted) return this._getFallbackContent('Aborted during semantic extraction');

      // Final cleanup
      extractedText = extractedText
        .replace(/\n{3,}/g, '\n\n')
        .replace(/ {2,}/g, ' ')
        .trim();

      if (!extractedText || extractedText.length < 100) {
        extractedText = document.body.innerText || document.body.textContent || '';
      }

      /**
       * CRITICAL ISSUE 6: Smart Metadata & Favicon
       */
      const getMeta = (n) => { 
        const m = document.querySelector(`meta[name="${n}"], meta[property="${n}"], meta[property="og:${n}"]`); 
        return m ? m.getAttribute('content') : null; 
      };

      const h1 = document.querySelector('h1');
      const smartTitle = getMeta('title') || (h1 ? h1.innerText.trim() : null) || document.title;

      const firstPara = Array.from(document.querySelectorAll('p'))
        .find(p => p.innerText.trim().length > 50)?.innerText.trim();
      const smartDescription = getMeta('description') || firstPara || '';

      // Favicon logic
      const getFavicon = () => {
        const link = document.querySelector('link[rel*="icon"]');
        return link ? link.href : `${window.location.origin}/favicon.ico`;
      };

      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 225));
      
      return {
        title: smartTitle,
        url: window.location.href,
        hostname: window.location.hostname.replace(/^www\./, ''), // Normalize domain
        favicon: getFavicon(),
        content: extractedText,
        text: extractedText,
        description: smartDescription,
        metadata: {
          description: smartDescription,
          author: getMeta('author') || getMeta('article:author'),
        },
        wordCount,
        readingTime,
        method: 'advanced_semantic_v2'
      };
    } catch (e) {
      return this._getFallbackContent(e.message);
    }
  }

  _processNode(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';

    const tag = node.tagName.toLowerCase();
    let result = '';

    for (const child of node.childNodes) {
      result += this._processNode(child);
    }

    switch (tag) {
      case 'p': return `\n\n${result.trim()}\n\n`;
      case 'h1': case 'h2': case 'h3': case 'h4':
        return `\n\n${'#'.repeat(parseInt(tag.charAt(1)) || 1)} ${result.trim()}\n\n`;
      case 'li': return `\n- ${result.trim()}`;
      default: return result;
    }
  }

  _getFallbackContent(reason) {
    return {
      title: document.title,
      url: window.location.href,
      hostname: window.location.hostname.replace(/^www\./, ''),
      content: '',
      text: '',
      metadata: { error: reason },
      wordCount: 0,
      readingTime: 1,
      method: 'fallback_error'
    };
  }
}

export const contentExtractor = new ContentExtractor();
export default ContentExtractor;
