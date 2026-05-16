export class ContentExtractor {
  constructor(options = {}) {
    this.options = options;
  }
  async extractWithTimeout(timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;
    return Promise.race([this.extractContent(signal), new Promise(resolve => setTimeout(() => {
      controller.abort();
      resolve(this._getFallbackContent('Timeout exceeded (5s)'));
    }, timeout))]);
  }
  async extractContent(signal) {
    try {
      if (signal?.aborted) return this._getFallbackContent('Aborted before start');
      const clone = document.cloneNode(true);
      const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'header', 'footer', 'aside',
        '.sidebar', '#sidebar', '.menu', '#menu', '.ad', '.ads', '.advertisement',
        '[role="banner"]', '[role="navigation"]', '[role="contentinfo"]',
        '.comments', '.cookie-banner', '#cookie-notice', '.newsletter-overlay',
        '.popup-newsletter', '.share-buttons', '.social-sidebar', '.newsletter-signup',
        '#mw-navigation', '#mw-panel', '.vector-header-container', '.vector-page-toolbar',
        '.vector-toc', '.vector-sticky-pinned-container', '.mw-portlet-lang', '#p-lang',
        '.uls-language-list', '.interlanguage-link', '.mw-interlanguage-selector',
        '.mw-editsection', '.infobox', '.navbox', '.catlinks', '.printfooter'
      ];
      unwantedSelectors.forEach(selector => {
        try {
          clone.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) {}
      });
      if (signal?.aborted) return this._getFallbackContent('Aborted during cleaning');
      let primaryNode = null;
      const primarySelectors = ['#mw-content-text .mw-parser-output', '#mw-content-text', 'article', 'main', '[role="main"]', '.content', '#content', '#main', '.post', '.entry'];
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
      let extractedText = this._processNode(primaryNode);
      if (signal?.aborted) return this._getFallbackContent('Aborted during semantic extraction');
      extractedText = this._cleanExtractedText(extractedText);
      if (!extractedText || extractedText.length < 100) {
        extractedText = this._cleanExtractedText(document.body.innerText || document.body.textContent || '');
      }
      const getMeta = n => {
        const m = document.querySelector(`meta[name="${n}"], meta[property="${n}"], meta[property="og:${n}"]`);
        return m ? m.getAttribute('content') : null;
      };
      const h1 = document.querySelector('h1');
      const smartTitle = this._cleanTitle(getMeta('title') || (h1 ? h1.innerText.trim() : null) || document.title);
      const firstPara = Array.from(document.querySelectorAll('p')).find(p => p.innerText.trim().length > 50)?.innerText.trim();
      const smartDescription = this._cleanExtractedText(getMeta('description') || firstPara || '');
      const getFavicon = () => {
        const link = document.querySelector('link[rel*="icon"]');
        return link ? link.href : `${window.location.origin}/favicon.ico`;
      };
      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 225));
      return {
        title: smartTitle,
        url: window.location.href,
        hostname: window.location.hostname.replace(/^www\./, ''),
        favicon: getFavicon(),
        content: extractedText,
        text: extractedText,
        description: smartDescription,
        metadata: {
          description: smartDescription,
          author: getMeta('author') || getMeta('article:author')
        },
        wordCount,
        readingTime,
        method: 'advanced_semantic_v2_wiki_nav_fix'
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
      case 'p':
        return `\n\n${result.trim()}\n\n`;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        return `\n\n${'#'.repeat(parseInt(tag.charAt(1)) || 1)} ${result.trim()}\n\n`;
      case 'li':
        return `\n- ${result.trim()}`;
      default:
        return result;
    }
  }
  _cleanExtractedText(text = '') {
    return String(text)
      .replace(/\r/g, '')
      .split(/\n+/)
      .map(line => line.replace(/\s+/g, ' ').trim())
      .filter(line => line && !this._isLanguageListLine(line) && !this._isBoilerplateLine(line))
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, ' ')
      .trim();
  }
  _isBoilerplateLine(line = '') {
    const clean = String(line).replace(/^#+\s*/, '').replace(/\s+/g, ' ').trim();
    return /^(contents?|appearance|hide|show|move to sidebar|navigation|main menu|personal tools|toggle|search|create account|log in|read|edit|view history|tools|languages?|references|external links|see also)$/i.test(clean);
  }
  _isLanguageListLine(line = '') {
    const clean = String(line).replace(/\s+/g, ' ').trim();
    const separatorCount = (clean.match(/\s[-\u2013\u2014\u2022|]\s/g) || []).length;
    return clean.length > 80 && (separatorCount > 4 || /\b\d+\s+languages\b/i.test(clean));
  }
  _cleanTitle(title = '') {
    let clean = String(title || '').replace(/^#+\s*/, '').replace(/\s+/g, ' ').replace(/\b\d+\s+languages\b.*$/i, '').replace(/\s[-\u2013\u2014|]\sWikipedia$/i, '').replace(/^(?:(?:contents?|appearance|hide|show|move to sidebar|navigation|main menu|personal tools|toggle|search|create account|log in|read|edit|view history|tools)\s+)+/i, '').replace(/\s+/g, ' ').trim();
    if (this._isLanguageListLine(clean)) clean = clean.split(/\s[-\u2013\u2014\u2022|]\s/)[0] || '';
    return clean || 'Current webpage';
  }
  _getFallbackContent(reason) {
    return {
      title: this._cleanTitle(document.title),
      url: window.location.href,
      hostname: window.location.hostname.replace(/^www\./, ''),
      content: '',
      text: '',
      metadata: {
        error: reason
      },
      wordCount: 0,
      readingTime: 1,
      method: 'fallback_error'
    };
  }
}
export const contentExtractor = new ContentExtractor();
export default ContentExtractor;
