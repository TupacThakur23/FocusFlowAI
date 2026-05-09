/**
 * RetrievalScorer - Hybrid Scoring System for FocusFlow AI
 * 
 * Provides intelligent scoring using multiple factors:
 * - Cosine similarity scoring
 * - Recency weighting
 * - Workbook relevance scoring
 * - User interaction frequency
 * - Source quality assessment
 * - Chunk importance scoring
 * - Retrieval diversity scoring
 */

class RetrievalScorer {
  constructor(options = {}) {
    this.config = {
      // Scoring weights (sum to 1.0)
      weights: {
        semanticSimilarity: options.weights?.semanticSimilarity || 0.35,
        recency: options.weights?.recency || 0.20,
        workbookRelevance: options.weights?.workbookRelevance || 0.15,
        userInteraction: options.weights?.userInteraction || 0.15,
        sourceQuality: options.weights?.sourceQuality || 0.10,
        chunkImportance: options.weights?.chunkImportance || 0.05
      },
      
      // Scoring parameters
      recencyDecay: options.recencyDecay || 30, // days
      minInteractionThreshold: options.minInteractionThreshold || 1,
      diversityPenalty: options.diversityPenalty || 0.1,
      relevanceBoost: options.relevanceBoost || 0.2,
      
      // Normalization
      enableNormalization: options.enableNormalization !== false,
      scoreRange: options.scoreRange || { min: 0, max: 1 }
    };

    this.scoringHistory = [];
    this.userPreferences = new Map();
    this.sourceReputation = new Map();
    
    this.initializeSourceReputation();
  }

  /**
   * Score retrieval results using hybrid approach
   * @param {Array} results - Retrieval results
   * @param {Object} query - Query information
   * @param {Object} context - Retrieval context
   * @returns {Array} Scored results
   */
  scoreResults(results, query, context = {}) {
    const startTime = Date.now();
    
    try {
      // Calculate individual scores
      const scoredResults = results.map(result => {
        const scores = this.calculateIndividualScores(result, query, context);
        const totalScore = this.calculateTotalScore(scores);
        
        return {
          ...result,
          scores,
          totalScore,
          scoreBreakdown: this.generateScoreBreakdown(scores, totalScore)
        };
      });

      // Apply diversity penalties
      const diversityAdjusted = this.applyDiversityAdjustments(scoredResults);
      
      // Normalize scores if enabled
      const normalized = this.config.enableNormalization 
        ? this.normalizeScores(diversityAdjusted)
        : diversityAdjusted;

      // Sort by final score
      const sorted = normalized.sort((a, b) => b.finalScore - a.finalScore);
      
      const scoringTime = Date.now() - startTime;
      
      // Store scoring history
      this.scoringHistory.push({
        timestamp: Date.now(),
        query: query.text,
        resultsCount: results.length,
        scoringTime,
        weights: this.config.weights
      });

      return {
        results: sorted,
        metadata: {
          originalCount: results.length,
          scoringTime,
          weights: this.config.weights,
          averageScore: sorted.reduce((sum, r) => sum + r.finalScore, 0) / sorted.length,
          scoreDistribution: this.calculateScoreDistribution(sorted)
        }
      };
      
    } catch (error) {
      console.error('Scoring failed:', error);
      throw new Error(`Scoring failed: ${error.message}`);
    }
  }

  /**
   * Calculate individual scoring factors
   * @param {Object} result - Single result
   * @param {Object} query - Query information
   * @param {Object} context - Retrieval context
   * @returns {Object} Individual scores
   */
  calculateIndividualScores(result, query, context) {
    const weights = this.config.weights;
    
    return {
      semanticSimilarity: this.calculateSemanticSimilarityScore(result, query),
      recency: this.calculateRecencyScore(result),
      workbookRelevance: this.calculateWorkbookRelevanceScore(result, context),
      userInteraction: this.calculateUserInteractionScore(result),
      sourceQuality: this.calculateSourceQualityScore(result),
      chunkImportance: this.calculateChunkImportanceScore(result),
      queryRelevance: this.calculateQueryRelevanceScore(result, query),
      contextAlignment: this.calculateContextAlignmentScore(result, context)
    };
  }

  /**
   * Calculate semantic similarity score
   * @param {Object} result - Result to score
   * @param {Object} query - Query information
   * @returns {number} Semantic similarity score (0-1)
   */
  calculateSemanticSimilarityScore(result, query) {
    if (!result.similarity || !query.embedding) return 0;
    
    // Normalize similarity score to 0-1 range
    const normalizedSimilarity = Math.max(0, Math.min(1, result.similarity));
    
    // Apply query-specific adjustments
    let adjustedScore = normalizedSimilarity;
    
    // Boost for exact keyword matches
    if (query.keywords && result.metadata.content) {
      const content = result.metadata.content.toLowerCase();
      const keywordMatches = query.keywords.filter(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        adjustedScore += (keywordMatches.length / query.keywords.length) * 0.1;
      }
    }
    
    return Math.min(1, adjustedScore);
  }

  /**
   * Calculate recency score
   * @param {Object} result - Result to score
   * @returns {number} Recency score (0-1)
   */
  calculateRecencyScore(result) {
    const timestamp = result.metadata.timestamp || result.metadata.createdAt || 0;
    if (!timestamp) return 0.5; // Neutral score for unknown timestamps
    
    const now = Date.now();
    const daysSinceCreation = (now - timestamp) / (1000 * 60 * 60 * 24);
    
    // Exponential decay function
    const decayRate = 1 / this.config.recencyDecay;
    const recencyScore = Math.exp(-decayRate * daysSinceCreation);
    
    return Math.max(0, Math.min(1, recencyScore));
  }

  /**
   * Calculate workbook relevance score
   * @param {Object} result - Result to score
   * @param {Object} context - Retrieval context
   * @returns {number} Workbook relevance score (0-1)
   */
  calculateWorkbookRelevanceScore(result, context) {
    const resultWorkbookId = result.metadata.workbookId;
    const activeWorkbooks = context.activeWorkbooks || [];
    const currentWorkbook = context.currentWorkbook;
    
    let score = 0.3; // Base score
    
    // Boost for active workbooks
    if (activeWorkbooks.includes(resultWorkbookId)) {
      score += this.config.relevanceBoost;
    }
    
    // Additional boost for current workbook
    if (currentWorkbook && resultWorkbookId === currentWorkbook) {
      score += this.config.relevanceBoost * 0.5;
    }
    
    // Consider workbook type relevance
    if (context.workbookTypes && result.metadata.workbookType) {
      const typeRelevance = this.calculateTypeRelevance(
        result.metadata.workbookType, 
        context.workbookTypes
      );
      score += typeRelevance * 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate user interaction score
   * @param {Object} result - Result to score
   * @returns {number} User interaction score (0-1)
   */
  calculateUserInteractionScore(result) {
    const chunkId = result.chunkId || result.id;
    const interactions = this.userPreferences.get(chunkId);
    
    if (!interactions) return 0.1; // Small score for unseen content
    
    // Calculate interaction metrics
    const totalInteractions = (interactions.views || 0) + 
                           (interactions.selections || 0) + 
                           (interactions.copies || 0);
    
    const daysSinceLastInteraction = interactions.lastInteraction 
      ? (Date.now() - interactions.lastInteraction) / (1000 * 60 * 60 * 24)
      : 365; // Long time ago
    
    // Frequency score (normalized)
    const frequencyScore = Math.min(1, totalInteractions / this.config.minInteractionThreshold);
    
    // Recency score (more recent = higher)
    const recencyScore = Math.max(0, 1 - daysSinceLastInteraction / 30);
    
    // Combine scores
    const combinedScore = (frequencyScore * 0.6) + (recencyScore * 0.4);
    
    return Math.min(1, combinedScore);
  }

  /**
   * Calculate source quality score
   * @param {Object} result - Result to score
   * @returns {number} Source quality score (0-1)
   */
  calculateSourceQualityScore(result) {
    const url = result.metadata.url;
    if (!url) return 0.5; // Neutral for unknown sources
    
    let score = 0.5; // Base score
    
    // Domain reputation
    const domain = new URL(url).hostname;
    const reputation = this.sourceReputation.get(domain);
    
    if (reputation) {
      score += reputation.score * 0.3;
    }
    
    // URL characteristics
    if (url.includes('edu') || url.includes('ac.uk')) {
      score += 0.2; // Academic sources
    }
    
    if (url.includes('gov')) {
      score += 0.25; // Government sources
    }
    
    // Check for reputable patterns
    const reputablePatterns = [
      'wikipedia.org', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov',
      'nature.com', 'science.org', 'ieee.org'
    ];
    
    for (const pattern of reputablePatterns) {
      if (url.includes(pattern)) {
        score += 0.15;
        break; // Only apply once
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate chunk importance score
   * @param {Object} result - Result to score
   * @returns {number} Chunk importance score (0-1)
   */
  calculateChunkImportanceScore(result) {
    const metadata = result.metadata;
    
    let score = 0.3; // Base score
    
    // Importance score from metadata
    if (metadata.importance) {
      score += Math.min(0.4, metadata.importance / 10);
    }
    
    // Heading level importance
    if (metadata.headingLevel) {
      const headingScore = Math.max(0, 1 - (metadata.headingLevel - 1) * 0.1);
      score += headingScore * 0.3;
    }
    
    // Content length importance (moderate length is better)
    const contentLength = metadata.contentLength || metadata.charCount || 0;
    if (contentLength > 50 && contentLength < 500) {
      score += 0.2; // Good length
    } else if (contentLength >= 500 && contentLength < 1000) {
      score += 0.1; // Acceptable length
    }
    
    // Semantic tags importance
    if (metadata.semanticTags && metadata.semanticTags.length > 0) {
      score += Math.min(0.2, metadata.semanticTags.length * 0.05);
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate query relevance score
   * @param {Object} result - Result to score
   * @param {Object} query - Query information
   * @returns {number} Query relevance score (0-1)
   */
  calculateQueryRelevanceScore(result, query) {
    if (!query.text || !result.metadata.content) return 0.5;
    
    const queryWords = query.text.toLowerCase().split(/\s+/);
    const content = result.metadata.content.toLowerCase();
    
    // Calculate word overlap
    const overlapWords = queryWords.filter(word => content.includes(word));
    const overlapRatio = overlapWords.length / queryWords.length;
    
    // Calculate phrase matches
    const phraseMatches = this.findPhraseMatches(query.text, content);
    const phraseScore = Math.min(0.3, phraseMatches * 0.1);
    
    // Combine scores
    const wordScore = overlapRatio * 0.7;
    const totalScore = wordScore + phraseScore;
    
    return Math.min(1, totalScore);
  }

  /**
   * Calculate context alignment score
   * @param {Object} result - Result to score
   * @param {Object} context - Retrieval context
   * @returns {number} Context alignment score (0-1)
   */
  calculateContextAlignmentScore(result, context) {
    if (!context.previousQueries || !context.userIntent) return 0.5;
    
    let score = 0.5; // Base score
    
    // Alignment with previous queries
    if (context.previousQueries && context.previousQueries.length > 0) {
      const alignmentScore = this.calculateQueryAlignment(
        result.metadata.content,
        context.previousQueries
      );
      score += alignmentScore * 0.3;
    }
    
    // Alignment with user intent
    if (context.userIntent && result.metadata.semanticTags) {
      const intentAlignment = this.calculateIntentAlignment(
        result.metadata.semanticTags,
        context.userIntent
      );
      score += intentAlignment * 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Calculate total weighted score
   * @param {Object} scores - Individual scores
   * @returns {number} Total score
   */
  calculateTotalScore(scores) {
    const weights = this.config.weights;
    
    return (
      scores.semanticSimilarity * weights.semanticSimilarity +
      scores.recency * weights.recency +
      scores.workbookRelevance * weights.workbookRelevance +
      scores.userInteraction * weights.userInteraction +
      scores.sourceQuality * weights.sourceQuality +
      scores.chunkImportance * weights.chunkImportance +
      scores.queryRelevance * 0.05 + // Small weight for query relevance
      scores.contextAlignment * 0.05   // Small weight for context alignment
    );
  }

  /**
   * Apply diversity adjustments to prevent clustering
   * @param {Array} scoredResults - Scored results
   * @returns {Array} Diversity-adjusted results
   */
  applyDiversityAdjustments(scoredResults) {
    const adjusted = [...scoredResults];
    
    for (let i = 0; i < adjusted.length; i++) {
      const current = adjusted[i];
      let diversityPenalty = 0;
      
      // Check for similarity with previous results
      for (let j = 0; j < i; j++) {
        const previous = adjusted[j];
        const similarity = this.calculateResultSimilarity(current, previous);
        
        if (similarity > 0.8) {
          diversityPenalty += this.config.diversityPenalty * similarity;
        }
      }
      
      adjusted[i] = {
        ...current,
        diversityPenalty,
        finalScore: Math.max(0, current.totalScore - diversityPenalty)
      };
    }
    
    return adjusted;
  }

  /**
   * Normalize scores to specified range
   * @param {Array} results - Results to normalize
   * @returns {Array} Normalized results
   */
  normalizeScores(results) {
    if (results.length === 0) return results;
    
    // Find min and max scores
    const scores = results.map(r => r.finalScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;
    
    if (range === 0) return results; // All scores are the same
    
    // Normalize to 0-1 range
    return results.map(result => ({
      ...result,
      finalScore: ((result.finalScore - minScore) / range) * 
        (this.config.scoreRange.max - this.config.scoreRange.min) + this.config.scoreRange.min
    }));
  }

  /**
   * Generate detailed score breakdown
   * @param {Object} scores - Individual scores
   * @param {number} totalScore - Total score
   * @returns {Object} Score breakdown
   */
  generateScoreBreakdown(scores, totalScore) {
    const weights = this.config.weights;
    
    return {
      semanticSimilarity: {
        score: scores.semanticSimilarity,
        weight: weights.semanticSimilarity,
        contribution: scores.semanticSimilarity * weights.semanticSimilarity,
        percentage: ((scores.semanticSimilarity * weights.semanticSimilarity) / totalScore * 100).toFixed(1) + '%'
      },
      recency: {
        score: scores.recency,
        weight: weights.recency,
        contribution: scores.recency * weights.recency,
        percentage: ((scores.recency * weights.recency) / totalScore * 100).toFixed(1) + '%'
      },
      workbookRelevance: {
        score: scores.workbookRelevance,
        weight: weights.workbookRelevance,
        contribution: scores.workbookRelevance * weights.workbookRelevance,
        percentage: ((scores.workbookRelevance * weights.workbookRelevance) / totalScore * 100).toFixed(1) + '%'
      },
      userInteraction: {
        score: scores.userInteraction,
        weight: weights.userInteraction,
        contribution: scores.userInteraction * weights.userInteraction,
        percentage: ((scores.userInteraction * weights.userInteraction) / totalScore * 100).toFixed(1) + '%'
      },
      sourceQuality: {
        score: scores.sourceQuality,
        weight: weights.sourceQuality,
        contribution: scores.sourceQuality * weights.sourceQuality,
        percentage: ((scores.sourceQuality * weights.sourceQuality) / totalScore * 100).toFixed(1) + '%'
      },
      chunkImportance: {
        score: scores.chunkImportance,
        weight: weights.chunkImportance,
        contribution: scores.chunkImportance * weights.chunkImportance,
        percentage: ((scores.chunkImportance * weights.chunkImportance) / totalScore * 100).toFixed(1) + '%'
      }
    };
  }

  /**
   * Calculate score distribution statistics
   * @param {Array} results - Scored results
   * @returns {Object} Score distribution
   */
  calculateScoreDistribution(results) {
    if (results.length === 0) return {};
    
    const scores = results.map(r => r.finalScore);
    
    return {
      mean: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      median: this.calculateMedian(scores),
      stdDev: this.calculateStandardDeviation(scores),
      min: Math.min(...scores),
      max: Math.max(...scores),
      quartiles: this.calculateQuartiles(scores)
    };
  }

  /**
   * Initialize source reputation database
   */
  initializeSourceReputation() {
    // Predefined reputable sources
    const reputableSources = [
      { domain: 'wikipedia.org', score: 0.8 },
      { domain: 'arxiv.org', score: 0.9 },
      { domain: 'pubmed.ncbi.nlm.nih.gov', score: 0.9 },
      { domain: 'nature.com', score: 0.85 },
      { domain: 'science.org', score: 0.8 },
      { domain: 'ieee.org', score: 0.85 },
      { domain: 'scholar.google.com', score: 0.7 },
      { domain: 'edu', score: 0.75 },
      { domain: 'gov', score: 0.8 }
    ];
    
    reputableSources.forEach(source => {
      this.sourceReputation.set(source.domain, { score: source.score });
    });
  }

  /**
   * Calculate type relevance
   * @param {string} workbookType - Workbook type
   * @param {Array} preferredTypes - Preferred types
   * @returns {number} Type relevance score
   */
  calculateTypeRelevance(workbookType, preferredTypes) {
    if (!preferredTypes || !Array.isArray(preferredTypes)) return 0.5;
    
    return preferredTypes.includes(workbookType) ? 0.3 : 0.1;
  }

  /**
   * Find phrase matches in content
   * @param {string} query - Query text
   * @param {string} content - Content text
   * @returns {number} Number of phrase matches
   */
  findPhraseMatches(query, content) {
    const queryPhrases = query.match(/"[^"]+"/g) || [];
    let matches = 0;
    
    for (const phrase of queryPhrases) {
      const cleanPhrase = phrase.replace(/"/g, '');
      if (content.includes(cleanPhrase)) {
        matches++;
      }
    }
    
    return matches;
  }

  /**
   * Calculate query alignment
   * @param {string} content - Content text
   * @param {Array} previousQueries - Previous queries
   * @returns {number} Alignment score
   */
  calculateQueryAlignment(content, previousQueries) {
    if (previousQueries.length === 0) return 0.5;
    
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    let totalAlignment = 0;
    
    for (const query of previousQueries) {
      const queryWords = query.toLowerCase().split(/\s+/);
      const commonWords = queryWords.filter(word => contentWords.has(word));
      const alignment = commonWords.length / queryWords.length;
      totalAlignment += alignment;
    }
    
    return totalAlignment / previousQueries.length;
  }

  /**
   * Calculate intent alignment
   * @param {Array} semanticTags - Content semantic tags
   * @param {string} userIntent - User intent
   * @returns {number} Intent alignment score
   */
  calculateIntentAlignment(semanticTags, userIntent) {
    const intentKeywords = {
      'research': ['methodology', 'results', 'analysis', 'findings'],
      'learning': ['introduction', 'explanation', 'definition', 'concept'],
      'summary': ['summary', 'conclusion', 'key points', 'takeaways'],
      'comparison': ['comparison', 'difference', 'similarity', 'versus']
    };
    
    const intentTagSet = new Set(intentKeywords[userIntent] || []);
    const alignmentScore = semanticTags.filter(tag => intentTagSet.has(tag)).length;
    
    return Math.min(1, alignmentScore / Math.max(1, semanticTags.length));
  }

  /**
   * Calculate result similarity for diversity penalty
   * @param {Object} result1 - First result
   * @param {Object} result2 - Second result
   * @returns {number} Similarity score
   */
  calculateResultSimilarity(result1, result2) {
    // Simple similarity based on URL and workbook
    if (result1.metadata.url === result2.metadata.url) return 1.0;
    if (result1.metadata.workbookId === result2.metadata.workbookId) return 0.8;
    
    // Content similarity (simplified)
    const content1 = (result1.metadata.content || '').toLowerCase();
    const content2 = (result2.metadata.content || '').toLowerCase();
    
    const words1 = new Set(content1.split(/\s+/));
    const words2 = new Set(content2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Calculate median value
   * @param {Array} values - Array of values
   * @returns {number} Median value
   */
  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate standard deviation
   * @param {Array} values - Array of values
   * @returns {number} Standard deviation
   */
  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Calculate quartiles
   * @param {Array} values - Array of values
   * @returns {Object} Quartile values
   */
  calculateQuartiles(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    return {
      q1: sorted[Math.floor(n * 0.25)],
      q2: sorted[Math.floor(n * 0.5)],
      q3: sorted[Math.floor(n * 0.75)]
    };
  }

  /**
   * Update scoring configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Validate weights sum to 1.0
    const totalWeight = Object.values(this.config.weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      console.warn('Scoring weights do not sum to 1.0:', totalWeight);
    }
  }

  /**
   * Get scoring statistics
   * @returns {Object} Scoring statistics
   */
  getStats() {
    return {
      config: this.config,
      scoringHistory: this.scoringHistory.slice(-100), // Last 100 scoring operations
      sourceReputationSize: this.sourceReputation.size,
      userPreferencesSize: this.userPreferences.size
    };
  }

  /**
   * Reset scorer state
   */
  reset() {
    this.scoringHistory = [];
    this.userPreferences.clear();
    this.sourceReputation.clear();
    this.initializeSourceReputation();
  }
}

// Export singleton instance
export const retrievalScorer = new RetrievalScorer();

// Export utilities
export const scoreResults = retrievalScorer.scoreResults.bind(retrievalScorer);
export const updateConfig = retrievalScorer.updateConfig.bind(retrievalScorer);
export const getStats = retrievalScorer.getStats.bind(retrievalScorer);
export const reset = retrievalScorer.reset.bind(retrievalScorer);

export default retrievalScorer;
