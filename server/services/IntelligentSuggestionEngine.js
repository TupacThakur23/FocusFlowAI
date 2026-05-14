class IntelligentSuggestionEngine {
  constructor(options = {}) {
    this.config = {
      maxSuggestionsPerType: options.maxSuggestionsPerType || 3,
      enableContextualSuggestions: options.enableContextualSuggestions !== false,
      enableFollowUpQuestions: options.enableFollowUpQuestions !== false,
      enableContradictionDetection: options.enableContradictionDetection !== false,
      contextWindow: options.contextWindow || 5,
      relevanceThreshold: options.relevanceThreshold || 0.6,
      diversityThreshold: options.diversityThreshold || 0.3,
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000,
      enableBatchProcessing: options.enableBatchProcessing !== false,
      maxTotalSuggestions: options.maxTotalSuggestions || 8,
      enableSubtleHints: options.enableSubtleHints !== false,
      suggestionPriority: options.suggestionPriority || 'relevance'
    };
    this.suggestionCache = new Map();
    this.contextAnalyzer = new Map();
    this.suggestionHistory = [];
    this.performanceMetrics = {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      ignoredSuggestions: 0,
      averageRelevance: 0,
      suggestionTypes: new Map()
    };
  }
  async generateSuggestions(context, options = {}) {
    try {
      const startTime = Date.now();
      const cacheKey = this.generateCacheKey(context, options);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
      const contextAnalysis = await this.analyzeContext(context);
      const suggestionTypes = ['related_notes', 'workbook_suggestions', 'follow_up_questions', 'related_concepts', 'unresolved_threads', 'contradiction_alerts', 'next_steps', 'productivity_hints'];
      const allSuggestions = [];
      for (const suggestionType of suggestionTypes) {
        const typeSuggestions = await this.generateSuggestionType(suggestionType, contextAnalysis, options);
        allSuggestions.push(...typeSuggestions);
      }
      const selectedSuggestions = this.selectBestSuggestions(allSuggestions, contextAnalysis);
      this.updatePerformanceMetrics(selectedSuggestions, startTime);
      this.setCache(cacheKey, selectedSuggestions);
      return selectedSuggestions;
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }
  async analyzeContext(context) {
    const analysis = {
      currentTopic: context.currentTopic || '',
      recentQueries: context.recentQueries || [],
      activeWorkbooks: context.activeWorkbooks || [],
      recentNotes: context.recentNotes || [],
      researchThreads: context.researchThreads || [],
      currentUrl: context.currentUrl || '',
      pageTitle: context.pageTitle || '',
      userIntent: this.analyzeUserIntent(context),
      researchPhase: this.determineResearchPhase(context),
      focusAreas: this.identifyFocusAreas(context),
      knowledgeGaps: this.identifyKnowledgeGaps(context),
      contradictions: this.detectPotentialContradictions(context),
      productivity: this.assessProductivity(context)
    };
    this.contextAnalyzer.set(context.sessionId || 'default', analysis);
    return analysis;
  }
  async generateSuggestionType(suggestionType, contextAnalysis, options) {
    switch (suggestionType) {
      case 'related_notes':
        return this.generateRelatedNotesSuggestions(contextAnalysis, options);
      case 'workbook_suggestions':
        return this.generateWorkbookSuggestions(contextAnalysis, options);
      case 'follow_up_questions':
        return this.generateFollowUpQuestions(contextAnalysis, options);
      case 'related_concepts':
        return this.generateRelatedConcepts(contextAnalysis, options);
      case 'unresolved_threads':
        return this.generateUnresolvedThreads(contextAnalysis, options);
      case 'contradiction_alerts':
        return this.generateContradictionAlerts(contextAnalysis, options);
      case 'next_steps':
        return this.generateNextSteps(contextAnalysis, options);
      case 'productivity_hints':
        return this.generateProductivityHints(contextAnalysis, options);
      default:
        return [];
    }
  }
  generateRelatedNotesSuggestions(contextAnalysis, options) {
    const suggestions = [];
    const {
      currentTopic,
      recentNotes,
      focusAreas
    } = contextAnalysis;
    const relatedNotes = recentNotes.filter(note => this.calculateRelevance(note.content, currentTopic) >= this.config.relevanceThreshold);
    relatedNotes.sort((a, b) => {
      const relevanceA = this.calculateRelevance(a.content, currentTopic);
      const relevanceB = this.calculateRelevance(b.content, currentTopic);
      const recencyA = a.timestamp || 0;
      const recencyB = b.timestamp || 0;
      return relevanceB * 0.7 + recencyB * 0.3 - (relevanceA * 0.7 + recencyA * 0.3);
    });
    relatedNotes.slice(0, this.config.maxSuggestionsPerType).forEach((note, index) => {
      suggestions.push({
        id: `related_note_${index}`,
        type: 'related_notes',
        priority: 'medium',
        title: `Review: ${note.title || 'Related Note'}`,
        description: `This note contains relevant information about ${currentTopic}`,
        action: 'open_note',
        data: note,
        metadata: {
          relevance: this.calculateRelevance(note.content, currentTopic),
          similarity: this.calculateSimilarity(note.content, currentTopic),
          timestamp: note.timestamp
        }
      });
    });
    return suggestions;
  }
  generateWorkbookSuggestions(contextAnalysis, options) {
    const suggestions = [];
    const {
      currentTopic,
      activeWorkbooks,
      focusAreas
    } = contextAnalysis;
    const relevantWorkbooks = activeWorkbooks.filter(workbook => this.calculateWorkbookRelevance(workbook, currentTopic) >= this.config.relevanceThreshold);
    relevantWorkbooks.sort((a, b) => {
      const relevanceA = this.calculateWorkbookRelevance(a, currentTopic);
      const relevanceB = this.calculateWorkbookRelevance(b, currentTopic);
      const usageA = a.accessCount || 0;
      const usageB = b.accessCount || 0;
      return relevanceB * 0.6 + usageB * 0.4 - (relevanceA * 0.6 + usageA * 0.4);
    });
    relevantWorkbooks.slice(0, this.config.maxSuggestionsPerType).forEach((workbook, index) => {
      suggestions.push({
        id: `workbook_${index}`,
        type: 'workbook_suggestions',
        priority: 'medium',
        title: `Explore: ${workbook.title}`,
        description: `This workbook contains related research on ${currentTopic}`,
        action: 'open_workbook',
        data: workbook,
        metadata: {
          relevance: this.calculateWorkbookRelevance(workbook, currentTopic),
          accessCount: workbook.accessCount || 0,
          lastAccessed: workbook.lastAccessed || 0
        }
      });
    });
    return suggestions;
  }
  generateFollowUpQuestions(contextAnalysis, options) {
    const suggestions = [];
    const {
      currentTopic,
      recentQueries,
      researchPhase,
      knowledgeGaps
    } = contextAnalysis;
    const questions = this.generateQuestionsForPhase(researchPhase, currentTopic, knowledgeGaps);
    const uniqueQuestions = questions.filter(question => !recentQueries.some(query => this.calculateSimilarity(query, question) > 0.8));
    uniqueQuestions.slice(0, this.config.maxSuggestionsPerType).forEach((question, index) => {
      suggestions.push({
        id: `question_${index}`,
        type: 'follow_up_questions',
        priority: 'low',
        title: 'Ask Question',
        description: question,
        action: 'ask_question',
        data: {
          question,
          topic: currentTopic
        },
        metadata: {
          questionType: this.classifyQuestion(question),
          complexity: this.estimateQuestionComplexity(question),
          relevance: this.calculateRelevance(question, currentTopic)
        }
      });
    });
    return suggestions;
  }
  generateRelatedConcepts(contextAnalysis, options) {
    const suggestions = [];
    const {
      currentTopic,
      focusAreas,
      knowledgeGaps
    } = contextAnalysis;
    const currentConcepts = this.extractConcepts(currentTopic);
    const relatedConcepts = this.findRelatedConcepts(currentConcepts, focusAreas);
    const newConcepts = relatedConcepts.filter(concept => !focusAreas.some(area => this.calculateSimilarity(area, concept) > 0.7));
    newConcepts.slice(0, this.config.maxSuggestionsPerType).forEach((concept, index) => {
      suggestions.push({
        id: `concept_${index}`,
        type: 'related_concepts',
        priority: 'low',
        title: `Explore: ${concept}`,
        description: `Related concept that might provide additional insights`,
        action: 'explore_concept',
        data: {
          concept,
          relatedTo: currentTopic
        },
        metadata: {
          conceptType: this.classifyConcept(concept),
          relevance: this.calculateConceptRelevance(concept, currentTopic),
          novelty: this.calculateNovelty(concept, focusAreas)
        }
      });
    });
    return suggestions;
  }
  generateUnresolvedThreads(contextAnalysis, options) {
    const suggestions = [];
    const {
      researchThreads,
      currentTopic
    } = contextAnalysis;
    const unresolvedThreads = researchThreads.filter(thread => thread.status === 'active' && this.calculateRelevance(thread.topic, currentTopic) >= this.config.relevanceThreshold);
    unresolvedThreads.sort((a, b) => {
      const urgencyA = this.calculateThreadUrgency(a);
      const urgencyB = this.calculateThreadUrgency(b);
      const relevanceA = this.calculateRelevance(a.topic, currentTopic);
      const relevanceB = this.calculateRelevance(b.topic, currentTopic);
      return urgencyB * 0.6 + relevanceB * 0.4 - (urgencyA * 0.6 + relevanceA * 0.4);
    });
    unresolvedThreads.slice(0, this.config.maxSuggestionsPerType).forEach((thread, index) => {
      suggestions.push({
        id: `thread_${index}`,
        type: 'unresolved_threads',
        priority: 'high',
        title: `Continue: ${thread.topic}`,
        description: `Resume your research on this topic`,
        action: 'continue_thread',
        data: thread,
        metadata: {
          urgency: this.calculateThreadUrgency(thread),
          messages: thread.messages?.length || 0,
          lastActivity: thread.lastActivity || 0,
          relevance: this.calculateRelevance(thread.topic, currentTopic)
        }
      });
    });
    return suggestions;
  }
  generateContradictionAlerts(contextAnalysis, options) {
    const suggestions = [];
    const {
      contradictions,
      recentNotes
    } = contextAnalysis;
    if (!this.config.enableContradictionDetection || contradictions.length === 0) {
      return suggestions;
    }
    contradictions.slice(0, this.config.maxSuggestionsPerType).forEach((contradiction, index) => {
      suggestions.push({
        id: `contradiction_${index}`,
        type: 'contradiction_alerts',
        priority: 'critical',
        title: 'Contradiction Detected',
        description: `Conflicting information found: ${contradiction.description}`,
        action: 'investigate_contradiction',
        data: contradiction,
        metadata: {
          severity: contradiction.severity || 'medium',
          confidence: contradiction.confidence || 0.7,
          sources: contradiction.sources || [],
          impact: this.assessContradictionImpact(contradiction)
        }
      });
    });
    return suggestions;
  }
  generateNextSteps(contextAnalysis, options) {
    const suggestions = [];
    const {
      researchPhase,
      currentTopic,
      knowledgeGaps,
      productivity
    } = contextAnalysis;
    const nextSteps = this.generateNextStepsForPhase(researchPhase, currentTopic, knowledgeGaps);
    nextSteps.slice(0, this.config.maxSuggestionsPerType).forEach((step, index) => {
      suggestions.push({
        id: `next_step_${index}`,
        type: 'next_steps',
        priority: 'medium',
        title: step.title,
        description: step.description,
        action: 'execute_step',
        data: step,
        metadata: {
          stepType: step.type,
          estimatedTime: step.estimatedTime || 5,
          difficulty: step.difficulty || 'medium',
          relevance: this.calculateRelevance(step.description, currentTopic)
        }
      });
    });
    return suggestions;
  }
  generateProductivityHints(contextAnalysis, options) {
    const suggestions = [];
    const {
      productivity,
      researchPhase,
      focusAreas
    } = contextAnalysis;
    if (productivity < 0.5) {
      suggestions.push({
        id: 'productivity_low',
        type: 'productivity_hints',
        priority: 'low',
        title: 'Take a Break',
        description: 'Consider taking a short break to refresh your focus',
        action: 'suggest_break',
        data: {
          type: 'break',
          duration: 5
        },
        metadata: {
          hintType: 'break',
          urgency: 'low',
          productivity: productivity
        }
      });
    }
    if (focusAreas.length > 3) {
      suggestions.push({
        id: 'productivity_focus',
        type: 'productivity_hints',
        priority: 'low',
        title: 'Focus Your Research',
        description: 'Consider narrowing your focus to a few key areas',
        action: 'suggest_focus',
        data: {
          type: 'focus',
          areas: focusAreas.slice(0, 3)
        },
        metadata: {
          hintType: 'focus',
          urgency: 'low',
          focusCount: focusAreas.length
        }
      });
    }
    return suggestions;
  }
  selectBestSuggestions(allSuggestions, contextAnalysis) {
    const relevantSuggestions = allSuggestions.filter(suggestion => (suggestion.metadata?.relevance || 0) >= this.config.relevanceThreshold);
    const diverseSuggestions = this.ensureDiversity(relevantSuggestions);
    diverseSuggestions.sort((a, b) => {
      const priorityOrder = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };
      const priorityA = priorityOrder[a.priority] || 1;
      const priorityB = priorityOrder[b.priority] || 1;
      const relevanceA = a.metadata?.relevance || 0;
      const relevanceB = b.metadata?.relevance || 0;
      return priorityB * 0.7 + relevanceB * 0.3 - (priorityA * 0.7 + relevanceA * 0.3);
    });
    const selected = diverseSuggestions.slice(0, this.config.maxTotalSuggestions);
    if (this.config.enableSubtleHints) {
      this.addSubtleHints(selected, contextAnalysis);
    }
    return selected;
  }
  ensureDiversity(suggestions) {
    const typeCounts = new Map();
    const diverse = [];
    for (const suggestion of suggestions) {
      const type = suggestion.type;
      const count = typeCounts.get(type) || 0;
      if (count < this.config.maxSuggestionsPerType) {
        diverse.push(suggestion);
        typeCounts.set(type, count + 1);
      }
    }
    return diverse;
  }
  addSubtleHints(suggestions, contextAnalysis) {
    if (contextAnalysis.userIntent === 'deep_research') {
      suggestions.forEach(suggestion => {
        if (suggestion.type === 'related_concepts') {
          suggestion.metadata.subtleHint = true;
          suggestion.description += ' (for deeper understanding)';
        }
      });
    }
  }
  analyzeUserIntent(context) {
    const queries = context.recentQueries || [];
    const topics = context.recentTopics || [];
    const queryPatterns = {
      deep_research: queries.length > 5 && topics.length > 3,
      quick_lookup: queries.length <= 2,
      comparison: queries.some(q => q.includes('compare') || q.includes('vs')),
      synthesis: queries.some(q => q.includes('summarize') || q.includes('combine'))
    };
    return Object.keys(queryPatterns).find(key => queryPatterns[key]) || 'general';
  }
  determineResearchPhase(context) {
    const queries = context.recentQueries || [];
    const notes = context.recentNotes || [];
    if (queries.length === 0) return 'exploration';
    if (queries.length <= 3 && notes.length === 0) return 'initial_research';
    if (queries.length > 3 && notes.length > 0) return 'deep_dive';
    if (notes.length > 5) return 'synthesis';
    return 'ongoing';
  }
  identifyFocusAreas(context) {
    const topics = context.recentTopics || [];
    const queries = context.recentQueries || [];
    const focusAreas = new Set();
    topics.forEach(topic => focusAreas.add(topic));
    queries.forEach(query => {
      const concepts = this.extractConcepts(query);
      concepts.forEach(concept => focusAreas.add(concept));
    });
    return Array.from(focusAreas);
  }
  identifyKnowledgeGaps(context) {
    const gaps = [];
    const queries = context.recentQueries || [];
    const unansweredQuestions = queries.filter(query => query.includes('?') && queries.filter(q => this.calculateSimilarity(q, query) > 0.8).length === 1);
    gaps.push(...unansweredQuestions);
    return gaps;
  }
  detectPotentialContradictions(context) {
    const contradictions = [];
    const notes = context.recentNotes || [];
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const conflict = this.detectConflict(notes[i], notes[j]);
        if (conflict) {
          contradictions.push(conflict);
        }
      }
    }
    return contradictions;
  }
  assessProductivity(context) {
    const queries = context.recentQueries || [];
    const notes = context.recentNotes || [];
    const threads = context.researchThreads || [];
    let productivity = 0.5;
    productivity += Math.min(0.2, queries.length * 0.05);
    productivity += Math.min(0.2, notes.length * 0.04);
    const activeThreads = threads.filter(t => t.status === 'active').length;
    productivity += Math.min(0.1, activeThreads * 0.03);
    return Math.min(1, productivity);
  }
  calculateRelevance(text, topic) {
    if (!text || !topic) return 0;
    const textWords = new Set(text.toLowerCase().split(/\s+/));
    const topicWords = new Set(topic.toLowerCase().split(/\s+/));
    const intersection = new Set([...textWords].filter(word => topicWords.has(word)));
    const union = new Set([...textWords, ...topicWords]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  calculateWorkbookRelevance(workbook, topic) {
    let relevance = 0;
    relevance += this.calculateRelevance(workbook.title || '', topic) * 0.4;
    if (workbook.topics) {
      const topicRelevance = Math.max(...workbook.topics.map(t => this.calculateRelevance(t, topic)));
      relevance += topicRelevance * 0.6;
    }
    return relevance;
  }
  extractConcepts(text) {
    const conceptPatterns = [/\b(?:research|study|analysis|investigation)\b/gi, /\b(?:technology|science|medicine|education)\b/gi, /\b(?:policy|economy|business|market)\b/gi];
    const concepts = new Set();
    for (const pattern of conceptPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => concepts.add(match.toLowerCase()));
      }
    }
    return Array.from(concepts);
  }
  findRelatedConcepts(currentConcepts, focusAreas) {
    const relatedConcepts = new Set();
    for (const concept of currentConcepts) {
      const related = this.getRelatedConcepts(concept);
      related.forEach(c => relatedConcepts.add(c));
    }
    return Array.from(relatedConcepts).filter(concept => !focusAreas.some(area => this.calculateSimilarity(area, concept) > 0.7));
  }
  getRelatedConcepts(concept) {
    const relationships = {
      'research': ['study', 'investigation', 'analysis'],
      'technology': ['innovation', 'digital', 'software'],
      'science': ['research', 'experiment', 'discovery'],
      'medicine': ['health', 'treatment', 'diagnosis'],
      'education': ['learning', 'teaching', 'curriculum'],
      'policy': ['regulation', 'government', 'law'],
      'economy': ['market', 'business', 'finance']
    };
    return relationships[concept.toLowerCase()] || [];
  }
  generateQuestionsForPhase(phase, topic, knowledgeGaps) {
    const questionTemplates = {
      exploration: [`What are the key aspects of ${topic}?`, `How does ${topic} relate to other fields?`, `What are the current trends in ${topic}?`],
      initial_research: [`What are the main challenges in ${topic}?`, `Who are the key researchers in ${topic}?`, `What are the recent developments in ${topic}?`],
      deep_dive: [`How can ${topic} be applied practically?`, `What are the limitations of current ${topic} approaches?`, `What future directions might ${topic} take?`],
      synthesis: [`How do different aspects of ${topic} connect?`, `What are the overarching themes in ${topic}?`, `What conclusions can be drawn about ${topic}?`]
    };
    return questionTemplates[phase] || questionTemplates.exploration;
  }
  generateNextStepsForPhase(phase, topic, knowledgeGaps) {
    const stepTemplates = {
      exploration: [{
        title: 'Define Scope',
        description: 'Clearly define what aspects of the topic to explore',
        type: 'planning'
      }, {
        title: 'Initial Search',
        description: 'Conduct broad search to understand the landscape',
        type: 'research'
      }],
      initial_research: [{
        title: 'Literature Review',
        description: 'Review key papers and articles on the topic',
        type: 'research'
      }, {
        title: 'Expert Interviews',
        description: 'Seek insights from domain experts',
        type: 'networking'
      }],
      deep_dive: [{
        title: 'Data Analysis',
        description: 'Analyze available data and findings',
        type: 'analysis'
      }, {
        title: 'Experimentation',
        description: 'Conduct experiments or case studies',
        type: 'research'
      }],
      synthesis: [{
        title: 'Integrate Findings',
        description: 'Synthesize insights from multiple sources',
        type: 'synthesis'
      }, {
        title: 'Create Summary',
        description: 'Create comprehensive summary of findings',
        type: 'documentation'
      }]
    };
    return stepTemplates[phase] || stepTemplates.exploration;
  }
  generateCacheKey(context, options) {
    const contextStr = JSON.stringify(context);
    const optionsStr = JSON.stringify(options);
    return this.simpleHash(contextStr + optionsStr);
  }
  getFromCache(key) {
    if (!this.config.enableCaching) return null;
    const cached = this.suggestionCache.get(key);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }
    return null;
  }
  setCache(key, data) {
    if (!this.config.enableCaching) return;
    this.suggestionCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  isCacheExpired(cached) {
    return Date.now() - cached.timestamp > this.config.cacheTimeout;
  }
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  updatePerformanceMetrics(suggestions, startTime) {
    const duration = Date.now() - startTime;
    const totalSuggestions = this.performanceMetrics.totalSuggestions;
    this.performanceMetrics.totalSuggestions += suggestions.length;
    if (suggestions.length > 0) {
      const avgRelevance = suggestions.reduce((sum, s) => sum + (s.metadata?.relevance || 0), 0) / suggestions.length;
      this.performanceMetrics.averageRelevance = (this.performanceMetrics.averageRelevance * totalSuggestions + avgRelevance) / (totalSuggestions + suggestions.length);
    }
    suggestions.forEach(suggestion => {
      const type = suggestion.type;
      const count = this.performanceMetrics.suggestionTypes.get(type) || 0;
      this.performanceMetrics.suggestionTypes.set(type, count + 1);
    });
  }
  getStats() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.suggestionCache.size,
      contextAnalyzerSize: this.contextAnalyzer.size,
      config: this.config,
      capabilities: ['context-aware suggestions', 'related notes discovery', 'workbook recommendations', 'follow-up question generation', 'related concept exploration', 'unresolved thread tracking', 'contradiction detection', 'next step recommendations', 'productivity hints', 'diversity optimization', 'performance caching']
    };
  }
  reset() {
    this.suggestionCache.clear();
    this.contextAnalyzer.clear();
    this.suggestionHistory = [];
    this.performanceMetrics = {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      ignoredSuggestions: 0,
      averageRelevance: 0,
      suggestionTypes: new Map()
    };
  }
}
export const intelligentSuggestionEngine = new IntelligentSuggestionEngine();
export const generateSuggestions = intelligentSuggestionEngine.generateSuggestions.bind(intelligentSuggestionEngine);
export const getStats = intelligentSuggestionEngine.getStats.bind(intelligentSuggestionEngine);
export const reset = intelligentSuggestionEngine.reset.bind(intelligentSuggestionEngine);
export default intelligentSuggestionEngine;
