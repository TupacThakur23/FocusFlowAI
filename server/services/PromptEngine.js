/**
 * PromptEngine - Advanced AI Prompt Engineering for FocusFlow AI
 * 
 * Provides contextual, mode-aware prompting for:
 * - Dynamic prompt generation based on user intent
 * - Context-aware instruction layering
 * - Mode-specific prompt templates
 * - Source-grounded responses
 * - Structured output formatting
 */

class PromptEngine {
  constructor() {
    this.modes = {
      summarize: {
        name: 'Summarize',
        systemPrompt: 'You are a research assistant focused on creating clear, concise summaries.',
        temperature: 0.3,
        maxTokens: 500
      },
      explain: {
        name: 'Explain',
        systemPrompt: 'You are an expert educator who explains complex concepts in simple, accessible terms.',
        temperature: 0.5,
        maxTokens: 800
      },
      flashcards: {
        name: 'Flashcards',
        systemPrompt: 'You are creating flashcards for active recall learning. Format as Q&A pairs.',
        temperature: 0.2,
        maxTokens: 300
      },
      viva: {
        name: 'Viva',
        systemPrompt: 'You are conducting a viva examination. Ask probing questions to test deep understanding.',
        temperature: 0.4,
        maxTokens: 600
      },
      beginner: {
        name: 'Beginner',
        systemPrompt: 'You are teaching this topic to a complete beginner. Use analogies and simple examples.',
        temperature: 0.6,
        maxTokens: 700
      },
      expert: {
        name: 'Expert',
        systemPrompt: 'You are discussing this topic with domain experts. Use technical terminology and assume advanced knowledge.',
        temperature: 0.3,
        maxTokens: 800
      },
      quickNotes: {
        name: 'Quick Notes',
        systemPrompt: 'You are creating concise, structured study notes for quick review.',
        temperature: 0.2,
        maxTokens: 400
      },
      compare: {
        name: 'Compare',
        systemPrompt: 'You are comparing multiple sources or concepts. Highlight similarities and differences.',
        temperature: 0.4,
        maxTokens: 700
      }
    };

    this.templates = {
      research: {
        summary: 'Create a comprehensive summary of the following research content:\n\n{content}\n\nFocus on key insights, methodology, and implications.',
        explanation: 'Explain the following research content in detail:\n\n{content}\n\nBreak down complex concepts, provide examples, and ensure clarity for learning.',
        analysis: 'Analyze the following research:\n\n{content}\n\nProvide critical evaluation, identify strengths/weaknesses, and suggest improvements.',
        synthesis: 'Synthesize the following research sources:\n\n{content}\n\nIntegrate multiple perspectives into a coherent understanding.'
      },
      question: {
        factual: 'Answer the following question based on the provided context:\n\nQuestion: {question}\n\nContext: {context}\n\nProvide a factual, well-supported answer.',
        analytical: 'Analyze and answer the following question:\n\nQuestion: {question}\n\nContext: {context}\n\nProvide deep analysis and multiple perspectives.',
        creative: 'Provide a creative and insightful answer to:\n\nQuestion: {question}\n\nContext: {context}\n\nThink beyond conventional answers.',
        comparative: 'Compare and contrast the following:\n\nQuestion: {question}\n\nContext: {context}\n\nProvide detailed comparison with pros and cons.'
      },
      action: {
        explainSelection: 'Explain the following selected text in context:\n\nSelection: {selection}\n\nPage context: {context}\n\nProvide clear explanation with relevant background.',
        summarizeParagraph: 'Summarize this specific paragraph:\n\n{paragraph}\n\nFocus on the main point and supporting details.',
        simplifyContent: 'Simplify this content for easier understanding:\n\n{content}\n\nUse simpler language and shorter sentences.',
        generateFlashcard: 'Create a flashcard from this content:\n\n{content}\n\nFormat as: Front: [question] Back: [answer]',
        createNote: 'Create structured notes from this content:\n\n{content}\n\nUse headings, bullet points, and key takeaways.'
      }
    };

    this.contextWindow = {
      maxTokens: 4000,
      overlapTokens: 200,
      prioritySections: ['title', 'headings', 'summary', 'conclusion']
    };

    this.outputFormats = {
      summary: {
        structure: 'executive_summary',
        sections: ['main_points', 'key_insights', 'implications'],
        maxLength: 500
      },
      explanation: {
        structure: 'hierarchical',
        sections: ['overview', 'detailed_explanation', 'examples', 'key_terms'],
        maxLength: 800
      },
      flashcard: {
        structure: 'qa_pairs',
        format: 'front_back',
        maxPairs: 10
      },
      notes: {
        structure: 'outline',
        sections: ['main_topic', 'subtopics', 'key_points', 'examples'],
        maxLength: 600
      }
    };
  }

  /**
   * Generate contextual prompt based on mode and content
   * @param {string} mode - AI interaction mode
   * @param {Object} content - Content context
   * @param {Object} options - Additional options
   * @returns {Object} Generated prompt configuration
   */
  generatePrompt(mode, content, options = {}) {
    const modeConfig = this.modes[mode];
    if (!modeConfig) {
      throw new Error(`Unknown mode: ${mode}`);
    }

    const {
      context = '',
      question = '',
      selection = '',
      paragraph = '',
      sources = [],
      userLevel = 'intermediate',
      language = 'en',
      customInstructions = ''
    } = options;

    // Build context window
    const contextWindow = this.buildContextWindow(content, sources);
    
    // Select appropriate template
    const template = this.selectTemplate(mode, content.type);
    
    // Generate system prompt
    const systemPrompt = this.buildSystemPrompt(mode, userLevel, language, customInstructions);
    
    // Generate user prompt
    const userPrompt = this.buildUserPrompt(template, {
      context: contextWindow,
      question,
      selection,
      paragraph,
      sources: this.formatSources(sources),
      ...content
    });

    return {
      systemPrompt,
      userPrompt,
      mode,
      temperature: modeConfig.temperature,
      maxTokens: modeConfig.maxTokens,
      outputFormat: this.outputFormats[mode] || this.outputFormats.summary,
      metadata: {
        mode,
        contextSize: contextWindow.length,
        sourceCount: sources.length,
        userLevel,
        language,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Build context window from content and sources
   * @param {Object} content - Content data
   * @param {Array} sources - Source references
   * @returns {string} Formatted context window
   */
  buildContextWindow(content, sources = []) {
    let context = '';

    // Add priority sections first
    if (content.title) {
      context += `Title: ${content.title}\n\n`;
    }

    if (content.headings && content.headings.length > 0) {
      context += `Main Headings:\n${content.headings.map(h => `- ${h.text}`).join('\n')}\n\n`;
    }

    if (content.summary) {
      context += `Summary: ${content.summary}\n\n`;
    }

    // Add main content with token limit
    const mainContent = content.text || content.content || '';
    const maxContentTokens = this.contextWindow.maxTokens - this.estimateTokens(context);
    const truncatedContent = this.truncateToTokens(mainContent, maxContentTokens);
    
    context += `Content:\n${truncatedContent}\n\n`;

    // Add sources if available
    if (sources.length > 0) {
      context += `Sources:\n${this.formatSources(sources)}\n\n`;
    }

    return context;
  }

  /**
   * Select appropriate template based on mode and content type
   * @param {string} mode - AI interaction mode
   * @param {string} contentType - Type of content
   * @returns {string} Template string
   */
  selectTemplate(mode, contentType) {
    const templates = this.templates[contentType];
    if (!templates) {
      return this.templates.research.summary; // Fallback
    }

    switch (mode) {
      case 'summarize':
        return templates.summary || templates.research?.summary;
      case 'explain':
        return templates.explanation || templates.research?.explanation;
      case 'flashcards':
        return templates.flashcard || templates.action?.generateFlashcard;
      case 'viva':
        return templates.question?.analytical;
      case 'beginner':
        return templates.explanation || templates.research?.explanation;
      case 'expert':
        return templates.analysis || templates.research?.analysis;
      case 'quickNotes':
        return templates.notes || templates.action?.createNote;
      case 'compare':
        return templates.comparative || templates.research?.synthesis;
      default:
        return templates.summary || templates.research?.summary;
    }
  }

  /**
   * Build system prompt with mode-specific instructions
   * @param {string} mode - AI interaction mode
   * @param {string} userLevel - User expertise level
   * @param {string} language - Response language
   * @param {string} customInstructions - Additional instructions
   * @returns {string} System prompt
   */
  buildSystemPrompt(mode, userLevel, language, customInstructions) {
    const modeConfig = this.modes[mode];
    let systemPrompt = modeConfig.systemPrompt;

    // Add user level adjustments
    if (userLevel) {
      systemPrompt += this.getUserLevelInstructions(userLevel);
    }

    // Add language instructions
    if (language && language !== 'en') {
      systemPrompt += `\n\nRespond in ${language}.`;
    }

    // Add response format instructions
    systemPrompt += this.getResponseFormatInstructions(mode);

    // Add custom instructions
    if (customInstructions) {
      systemPrompt += `\n\nAdditional instructions: ${customInstructions}`;
    }

    // Add quality guidelines
    systemPrompt += this.getQualityGuidelines(mode);

    return systemPrompt;
  }

  /**
   * Get user level specific instructions
   * @param {string} level - User expertise level
   * @returns {string} Level-specific instructions
   */
  getUserLevelInstructions(level) {
    const instructions = {
      beginner: '\n\nUse simple language, avoid jargon, provide examples, and explain step-by-step.',
      intermediate: '\n\nAssume some background knowledge but explain key concepts. Balance depth with clarity.',
      advanced: '\n\nUse appropriate technical terminology. Assume deep understanding of fundamentals.',
      expert: '\n\nUse expert-level terminology and concepts. Focus on nuance and advanced implications.'
    };

    return instructions[level] || instructions.intermediate;
  }

  /**
   * Get response format instructions for mode
   * @param {string} mode - AI interaction mode
   * @returns {string} Format instructions
   */
  getResponseFormatInstructions(mode) {
    const formatConfig = this.outputFormats[mode];
    if (!formatConfig) return '';

    let instructions = '\n\nResponse format:';

    switch (formatConfig.structure) {
      case 'executive_summary':
        instructions += `
- Main Points: 3-5 bullet points
- Key Insights: 2-3 significant observations
- Implications: 1-2 practical takeaways
- Maximum length: ${formatConfig.maxLength} words`;
        break;

      case 'hierarchical':
        instructions += `
- Overview: Brief introduction
- Detailed Explanation: Structured with subheadings
- Examples: 1-2 concrete examples
- Key Terms: 3-5 important concepts
- Maximum length: ${formatConfig.maxLength} words`;
        break;

      case 'qa_pairs':
        instructions += `
- Format: Front: [question] Back: [answer]
- Maximum ${formatConfig.maxPairs} pairs
- Questions should test understanding
- Answers should be concise but complete`;
        break;

      case 'outline':
        instructions += `
- Main Topic: Clear heading
- Subtopics: 2-4 key areas
- Key Points: Bullet points under each subtopic
- Examples: 1-2 illustrative examples
- Maximum length: ${formatConfig.maxLength} words`;
        break;

      default:
        instructions += `Provide clear, structured response appropriate for ${mode}.`;
    }

    return instructions;
  }

  /**
   * Get quality guidelines for responses
   * @param {string} mode - AI interaction mode
   * @returns {string} Quality guidelines
   */
  getQualityGuidelines(mode) {
    const baseGuidelines = `
- Be accurate and factual
- Cite sources when provided
- Avoid speculation beyond the given context
- Maintain consistent tone and style
- Ensure responses are helpful and actionable`;

    const modeSpecific = {
      summarize: '\n- Focus on key information and insights\n- Preserve important details\n- Use clear, concise language',
      explain: '\n- Break down complex concepts\n- Use analogies and examples\n- Check for understanding before proceeding',
      flashcards: '\n- Create effective test questions\n- Ensure answers are correct and complete\n- Cover main concepts comprehensively',
      viva: '\n- Ask probing questions that test deep understanding\n- Challenge assumptions constructively\n- Encourage critical thinking',
      beginner: '\n- Use simple, accessible language\n- Provide step-by-step explanations\n- Include helpful analogies',
      expert: '\n- Use appropriate technical terminology\n- Address nuanced aspects\n- Consider advanced implications',
      quickNotes: '\n- Extract most important information\n- Use structured formatting\n- Include key definitions'
    };

    return baseGuidelines + (modeSpecific[mode] || '');
  }

  /**
   * Build user prompt with template variables
   * @param {string} template - Prompt template
   * @param {Object} variables - Template variables
   * @returns {string} Formatted user prompt
   */
  buildUserPrompt(template, variables) {
    let prompt = template;

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (typeof value === 'string') {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
      } else if (Array.isArray(value)) {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), value.join('\n'));
      } else if (typeof value === 'object') {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), JSON.stringify(value, null, 2));
      }
    });

    return prompt;
  }

  /**
   * Format sources for inclusion in prompts
   * @param {Array} sources - Source references
   * @returns {string} Formatted sources
   */
  formatSources(sources) {
    if (!sources || sources.length === 0) return '';

    return sources.map((source, index) => {
      const citation = `[${index + 1}]`;
      let sourceText = '';

      if (typeof source === 'string') {
        sourceText = source;
      } else if (source.title) {
        sourceText = `${source.title}${source.url ? ` (${source.url})` : ''}`;
      } else if (source.url) {
        sourceText = source.url;
      }

      return `${citation} ${sourceText}`;
    }).join('\n');
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    // Simple estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate text to fit within token limit
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum tokens allowed
   * @returns {string} Truncated text
   */
  truncateToTokens(text, maxTokens) {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) return text;

    // Try to truncate at sentence boundaries
    const truncated = text.substring(0, maxChars);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxChars * 0.8) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }

    return truncated + '...';
  }

  /**
   * Generate streaming prompt configuration
   * @param {string} mode - AI interaction mode
   * @param {Object} content - Content context
   * @param {Object} options - Streaming options
   * @returns {Object} Streaming prompt configuration
   */
  generateStreamingPrompt(mode, content, options = {}) {
    const basePrompt = this.generatePrompt(mode, content, options);
    
    return {
      ...basePrompt,
      streaming: {
        enabled: true,
        chunkSize: options.chunkSize || 100,
        overlap: options.overlap || 20,
        onChunk: options.onChunk || ((chunk) => {
          console.log('Streaming chunk:', chunk);
        }),
        onComplete: options.onComplete || ((fullResponse) => {
          console.log('Streaming complete:', fullResponse);
        })
      }
    };
  }

  /**
   * Generate contextual action prompt
   * @param {string} action - Type of contextual action
   * @param {Object} context - Action context
   * @returns {Object} Action prompt configuration
   */
  generateActionPrompt(action, context) {
    const actionPrompts = {
      explainSelection: {
        systemPrompt: 'You are explaining selected text in its webpage context.',
        userPrompt: `Explain this selected text: "${context.selection}"\n\nPage context: ${context.pageContext}\n\nProvide clear, contextual explanation.`
      },
      summarizeParagraph: {
        systemPrompt: 'You are creating a concise summary of a specific paragraph.',
        userPrompt: `Summarize this paragraph: "${context.paragraph}"\n\nFocus on the main point and key supporting details.`
      },
      simplifyContent: {
        systemPrompt: 'You are simplifying complex content for better understanding.',
        userPrompt: `Simplify this content: "${context.content}"\n\nUse simpler language and shorter sentences.`
      },
      generateFlashcard: {
        systemPrompt: 'You are creating flashcards for active recall.',
        userPrompt: `Create a flashcard from: "${context.content}"\n\nFormat as: Front: [question] Back: [answer]`
      },
      createNote: {
        systemPrompt: 'You are creating structured study notes.',
        userPrompt: `Create structured notes from: "${context.content}"\n\nUse headings, bullet points, and key takeaways.`
      }
    };

    const promptConfig = actionPrompts[action];
    if (!promptConfig) {
      throw new Error(`Unknown action: ${action}`);
    }

    return {
      systemPrompt: promptConfig.systemPrompt,
      userPrompt: promptConfig.userPrompt,
      action,
      temperature: 0.4,
      maxTokens: 300
    };
  }

  /**
   * Get available modes
   * @returns {Array} Available AI modes
   */
  getAvailableModes() {
    return Object.keys(this.modes).map(key => ({
      id: key,
      name: this.modes[key].name,
      temperature: this.modes[key].temperature,
      maxTokens: this.modes[key].maxTokens
    }));
  }

  /**
   * Get mode configuration
   * @param {string} mode - Mode identifier
   * @returns {Object} Mode configuration
   */
  getModeConfig(mode) {
    return this.modes[mode];
  }

  /**
   * Update mode configuration
   * @param {string} mode - Mode identifier
   * @param {Object} config - New configuration
   */
  updateModeConfig(mode, config) {
    if (this.modes[mode]) {
      this.modes[mode] = { ...this.modes[mode], ...config };
    }
  }

  /**
   * Add custom template
   * @param {string} category - Template category
   * @param {string} name - Template name
   * @param {string} template - Template string
   */
  addTemplate(category, name, template) {
    if (!this.templates[category]) {
      this.templates[category] = {};
    }
    this.templates[category][name] = template;
  }

  /**
   * Get prompt statistics
   * @returns {Object} Prompt engine statistics
   */
  getStats() {
    return {
      modesCount: Object.keys(this.modes).length,
      templatesCount: Object.keys(this.templates).length,
      contextWindowSize: this.contextWindow.maxTokens,
      supportedActions: Object.keys(this.templates.action || {}),
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const promptEngine = new PromptEngine();

// Export utilities
export const generatePrompt = promptEngine.generatePrompt.bind(promptEngine);
export const generateStreamingPrompt = promptEngine.generateStreamingPrompt.bind(promptEngine);
export const generateActionPrompt = promptEngine.generateActionPrompt.bind(promptEngine);
export const getAvailableModes = promptEngine.getAvailableModes.bind(promptEngine);
export const getModeConfig = promptEngine.getModeConfig.bind(promptEngine);
export const updateModeConfig = promptEngine.updateModeConfig.bind(promptEngine);
export const addTemplate = promptEngine.addTemplate.bind(promptEngine);
export const getStats = promptEngine.getStats.bind(promptEngine);

export default promptEngine;
