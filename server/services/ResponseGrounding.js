

class ResponseGrounding {
  constructor(options = {}) {
    this.config = {

      enableCitations: options.enableCitations !== false,
      citationStyle: options.citationStyle || 'numeric', // numeric, author-date, footnote
      maxCitationsPerResponse: options.maxCitationsPerResponse || 10,
      minCitationConfidence: options.minCitationConfidence || 0.3,
      

      enableGrounding: options.enableGrounding !== false,
      groundingThreshold: options.groundingThreshold || 0.5,
      requireSourceEvidence: options.requireSourceEvidence !== false,
      maxGroundingDistance: options.maxGroundingDistance || 2,
      

      enableConfidenceScoring: options.enableConfidenceScoring !== false,
      confidenceFactors: options.confidenceFactors || {
        sourceRelevance: 0.4,
        evidenceStrength: 0.3,
        retrievalScore: 0.2,
        recency: 0.1
      },
      

      enableHallucinationDetection: options.enableHallucinationDetection !== false,
      hallucinationThreshold: options.hallucinationThreshold || 0.3,
      contradictionDetection: options.contradictionDetection !== false,
      

      enableStructuredFormatting: options.enableStructuredFormatting !== false,
      includeMetadata: options.includeMetadata !== false,
      enableInteractiveCitations: options.enableInteractiveCitations !== false
    };

    this.citationTracker = new Map();
    this.evidenceMap = new Map();
    this.confidenceHistory = [];
    this.hallucinationPatterns = new Map();
  }

  
  async groundResponse(aiResponse, retrievedContext, query) {
    try {

      const claims = this.extractClaims(aiResponse.content);
      

      const groundedClaims = await this.matchClaimsToEvidence(claims, retrievedContext);
      

      const scoredClaims = this.calculateClaimConfidence(groundedClaims, query);
      

      const hallucinationAnalysis = this.detectHallucinations(scoredClaims);
      

      const citations = this.generateCitations(scoredClaims, retrievedContext);
      

      const groundedResponse = this.buildGroundedResponse(
        aiResponse,
        scoredClaims,
        citations,
        hallucinationAnalysis
      );

      this.trackGrounding(groundedResponse, query, retrievedContext);

      return groundedResponse;

    } catch (error) {
      console.error('Response grounding failed:', error);
      throw new Error(`Response grounding failed: ${error.message}`);
    }
  }

  
  extractClaims(content) {
    const claims = [];
    const sentences = content.split(/[.!?]+/);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 10) continue; // Skip very short sentences
      

      const claimPatterns = [
        /(?:according to|based on|research shows|studies indicate|evidence suggests)(.+?)/gi,
        /(?:it is|they are|this means|therefore|consequently)(.+?)/gi,
        /(?:the main reason|primary cause|key factor)(.+?)/gi,
        /(?:results show|findings indicate|data suggests)(.+?)/gi
      ];

      let isClaim = false;
      let claimType = 'statement';
      
      for (const pattern of claimPatterns) {
        if (pattern.test(sentence)) {
          isClaim = true;
          claimType = 'evidence_based';
          break;
        }
      }

      if (!isClaim) {
        const factualPatterns = [
          /\d+(?:\.\d+)?%/, // percentages
          /\d+(?:\.\d+)?\s*(?:million|billion|thousand)/, // large numbers
          /\b(?:always|never|all|none|every|only)\b/, // absolute terms
          /\b(?:discovered|invented|created|developed)\b/ // discovery terms
        ];
        
        isClaim = factualPatterns.some(pattern => pattern.test(sentence));
        if (isClaim) claimType = 'factual';
      }

      if (isClaim || sentence.length > 50) { // Include longer sentences as potential claims
        claims.push({
          id: `claim_${i}_${Date.now()}`,
          text: sentence,
          type: claimType,
          position: i,
          confidence: 0.5, // Will be updated later
          evidence: [],
          citations: []
        });
      }
    }

    return claims;
  }

  
  async matchClaimsToEvidence(claims, context) {
    const groundedClaims = [];

    for (const claim of claims) {
      const evidence = [];
      
      for (const chunk of context) {
        const relevanceScore = this.calculateClaimRelevance(claim, chunk);
        
        if (relevanceScore >= this.config.groundingThreshold) {
          evidence.push({
            chunkId: chunk.chunkId || chunk.id,
            source: chunk.metadata.url || 'Unknown',
            title: chunk.metadata.workbookTitle || 'Unknown',
            content: chunk.metadata.content || '',
            relevance: relevanceScore,
            retrievalScore: chunk.totalScore || 0,
            timestamp: chunk.metadata.timestamp || chunk.metadata.createdAt,
            semanticTags: chunk.metadata.semanticTags || []
          });
        }
      }

      evidence.sort((a, b) => b.relevance - a.relevance);

      groundedClaims.push({
        ...claim,
        evidence: evidence.slice(0, 5), // Top 5 pieces of evidence
        hasEvidence: evidence.length > 0,
        evidenceStrength: this.calculateEvidenceStrength(evidence)
      });
    }

    return groundedClaims;
  }

  
  calculateClaimConfidence(claims, query) {
    const factors = this.config.confidenceFactors;
    
    return claims.map(claim => {
      let confidence = 0.5; // Base confidence

      if (claim.evidence.length > 0) {
        const avgSourceRelevance = claim.evidence.reduce((sum, ev) => sum + ev.relevance, 0) / claim.evidence.length;
        confidence += avgSourceRelevance * factors.sourceRelevance;
      }

      confidence += claim.evidenceStrength * factors.evidenceStrength;

      if (claim.evidence.length > 0) {
        const avgRetrievalScore = claim.evidence.reduce((sum, ev) => sum + ev.retrievalScore, 0) / claim.evidence.length;
        confidence += (avgRetrievalScore / 10) * factors.retrievalScore; // Normalize retrieval score
      }

      if (claim.evidence.length > 0) {
        const avgAge = claim.evidence.reduce((sum, ev) => {
          const age = ev.timestamp ? (Date.now() - new Date(ev.timestamp).getTime()) / (1000 * 60 * 60 * 24) : 365;
          return sum + age;
        }, 0) / claim.evidence.length;
        
        const recencyScore = Math.max(0, 1 - avgAge / 365); // Newer is better
        confidence += recencyScore * factors.recency;
      }

      const queryAlignment = this.calculateQueryAlignment(claim.text, query.text);
      confidence += queryAlignment * 0.1; // Small weight for query alignment

      if (claim.evidence.length === 0) {
        confidence *= 0.3; // Significant penalty
      }

      claim.confidence = Math.max(0, Math.min(1, confidence));
      return claim;
    });
  }

  
  detectHallucinations(claims) {
    const hallucinationAnalysis = {
      totalClaims: claims.length,
      hallucinatedClaims: [],
      lowConfidenceClaims: [],
      contradictoryClaims: [],
      overallRisk: 'low',
      riskScore: 0
    };

    for (const claim of claims) {

      const hallucinationRisk = this.assessHallucinationRisk(claim);
      
      if (hallucinationRisk > this.config.hallucinationThreshold) {
        hallucinationAnalysis.hallucinatedClaims.push({
          ...claim,
          riskScore: hallucinationRisk,
          riskFactors: this.getHallucinationFactors(claim)
        });
      }

      if (claim.confidence < this.config.minCitationConfidence) {
        hallucinationAnalysis.lowConfidenceClaims.push(claim);
      }

      const contradictions = this.findContradictions(claim, claims);
      if (contradictions.length > 0) {
        hallucinationAnalysis.contradictoryClaims.push({
          ...claim,
          contradictions
        });
      }
    }

    const hallucinatedRatio = hallucinationAnalysis.hallucinatedClaims.length / claims.length;
    const lowConfidenceRatio = hallucinationAnalysis.lowConfidenceClaims.length / claims.length;
    const contradictionRatio = hallucinationAnalysis.contradictoryClaims.length / claims.length;

    hallucinationAnalysis.riskScore = (
      hallucinatedRatio * 0.5 +
      lowConfidenceRatio * 0.3 +
      contradictionRatio * 0.2
    );

    if (hallucinationAnalysis.riskScore > 0.7) {
      hallucinationAnalysis.overallRisk = 'high';
    } else if (hallucinationAnalysis.riskScore > 0.4) {
      hallucinationAnalysis.overallRisk = 'medium';
    } else {
      hallucinationAnalysis.overallRisk = 'low';
    }

    return hallucinationAnalysis;
  }

  
  generateCitations(claims, context) {
    const citations = [];
    const citationMap = new Map();

    for (const claim of claims) {
      for (const evidence of claim.evidence) {
        if (!citationMap.has(evidence.chunkId)) {
          const citation = {
            id: `cite_${evidence.chunkId}`,
            chunkId: evidence.chunkId,
            source: evidence.source,
            title: evidence.title,
            content: this.extractCitationContent(evidence.content),
            relevance: evidence.relevance,
            retrievalScore: evidence.retrievalScore,
            timestamp: evidence.timestamp,
            claims: [claim.id],
            type: this.determineCitationType(evidence),
            confidence: evidence.relevance
          };

          citationMap.set(evidence.chunkId, citation);
        } else {

          citationMap.get(evidence.chunkId).claims.push(claim.id);
        }
      }
    }

    const allCitations = Array.from(citationMap.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, this.config.maxCitationsPerResponse);

    return allCitations.map((citation, index) => ({
      ...citation,
      formatted: this.formatCitation(citation, index + 1),
      index: index + 1
    }));
  }

  
  buildGroundedResponse(originalResponse, groundedClaims, citations, hallucinationAnalysis) {

    let groundedContent = originalResponse.content;
    
    if (this.config.enableCitations) {
      groundedContent = this.insertCitationsIntoContent(groundedContent, groundedClaims, citations);
    }

    const groundedResponse = {
      ...originalResponse,
      content: groundedContent,
      grounded: true,
      citations: citations,
      claims: groundedClaims,
      hallucinationAnalysis,
      confidence: this.calculateOverallConfidence(groundedClaims),
      grounding: {
        totalClaims: groundedClaims.length,
        claimsWithEvidence: groundedClaims.filter(c => c.evidence.length > 0).length,
        evidenceSources: citations.length,
        groundingScore: this.calculateGroundingScore(groundedClaims),
        timestamp: new Date().toISOString()
      }
    };

    if (this.config.enableStructuredFormatting) {
      groundedResponse.formatted = this.formatGroundedResponse(groundedResponse);
    }

    return groundedResponse;
  }

  
  insertCitationsIntoContent(content, claims, citations) {
    let annotatedContent = content;
    

    const citationIndexMap = new Map();
    citations.forEach((citation, index) => {
      citation.claims.forEach(claimId => {
        if (!citationIndexMap.has(claimId)) {
          citationIndexMap.set(claimId, []);
        }
        citationIndexMap.get(claimId).push(index + 1);
      });
    });

    for (const claim of claims) {
      const citationIndices = citationIndexMap.get(claim.id) || [];
      
      if (citationIndices.length > 0) {
        const citationText = this.formatInlineCitation(citationIndices);
        const claimRegex = new RegExp(claim.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        annotatedContent = annotatedContent.replace(claimRegex, `${claim.text}${citationText}`);
      }
    }

    return annotatedContent;
  }

  
  formatCitation(citation, index) {
    switch (this.config.citationStyle) {
      case 'numeric':
        return `[${index}]`;
      case 'author-date':
        return `(${citation.title}, ${new Date(citation.timestamp).getFullYear()})`;
      case 'footnote':
        return `¹`;
      default:
        return `[${index}]`;
    }
  }

  
  formatInlineCitation(indices) {
    if (indices.length === 1) {
      return this.formatCitation({}, indices[0]);
    } else {
      return `[${indices.join(', ')}]`;
    }
  }

  
  formatGroundedResponse(groundedResponse) {
    return {
      ...groundedResponse,
      sections: {
        mainContent: groundedResponse.content,
        citations: this.formatCitationsSection(groundedResponse.citations),
        evidence: this.formatEvidenceSection(groundedResponse.claims),
        confidence: this.formatConfidenceSection(groundedResponse.confidence),
        warnings: this.formatWarningsSection(groundedResponse.hallucinationAnalysis)
      },
      interactive: this.config.enableInteractiveCitations ? 
        this.generateInteractiveElements(groundedResponse) : null
    };
  }

  
  calculateClaimRelevance(claim, chunk) {
    const claimWords = new Set(claim.text.toLowerCase().split(/\s+/));
    const evidenceWords = new Set((chunk.content || '').toLowerCase().split(/\s+/));
    

    const intersection = new Set([...claimWords].filter(word => evidenceWords.has(word)));
    const overlapRatio = intersection.size / Math.max(claimWords.size, evidenceWords.size);
    

    const semanticBoost = this.calculateSemanticBoost(claim, chunk);
    

    const distanceBoost = this.calculateDistanceBoost(claim, chunk);
    
    return Math.min(1, overlapRatio + semanticBoost + distanceBoost);
  }

  
  calculateEvidenceStrength(evidence) {
    if (evidence.length === 0) return 0;
    
    const avgRelevance = evidence.reduce((sum, ev) => sum + ev.relevance, 0) / evidence.length;
    const sourceDiversity = new Set(evidence.map(ev => ev.source)).size;
    const diversityBonus = Math.min(0.2, sourceDiversity * 0.05);
    
    return Math.min(1, avgRelevance + diversityBonus);
  }

  
  calculateQueryAlignment(claimText, queryText) {
    const claimWords = new Set(claimText.toLowerCase().split(/\s+/));
    const queryWords = new Set(queryText.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...claimWords].filter(word => queryWords.has(word)));
    return queryWords.size > 0 ? intersection.size / queryWords.size : 0;
  }

  
  assessHallucinationRisk(claim) {
    let risk = 0;
    

    const highRiskPatterns = [
      /\b(?:always|never|all|none|every|only)\b/gi, // Absolute terms
      /\b(?:definitely|certainly|obviously|clearly)\b/gi, // Certainty terms
      /\b(?:impossible|unbelievable|unprecedented)\b/gi, // Extreme claims
      /\d{4,}/g // Very specific numbers without context
    ];

    for (const pattern of highRiskPatterns) {
      const matches = claim.text.match(pattern);
      if (matches) {
        risk += matches.length * 0.2;
      }
    }

    if (claim.evidence.length > 0) {
      risk *= 0.3; // Significant risk reduction with evidence
    }

    if (claim.confidence < 0.3) {
      risk += 0.3;
    }

    return Math.min(1, risk);
  }

  
  getHallucinationFactors(claim) {
    const factors = [];
    
    if (claim.evidence.length === 0) {
      factors.push('no_evidence');
    }
    
    if (claim.confidence < 0.3) {
      factors.push('low_confidence');
    }
    
    if (claim.text.length > 200) {
      factors.push('overly_specific');
    }
    
    const absoluteTerms = claim.text.match(/\b(?:always|never|all|none|every|only)\b/gi);
    if (absoluteTerms) {
      factors.push('absolute_claims');
    }
    
    return factors;
  }

  
  findContradictions(claim, allClaims) {
    const contradictions = [];
    
    for (const otherClaim of allClaims) {
      if (otherClaim.id === claim.id) continue;
      
      const contradictionScore = this.calculateContradictionScore(claim, otherClaim);
      if (contradictionScore > 0.7) {
        contradictions.push({
          claimId: otherClaim.id,
          claimText: otherClaim.text,
          contradictionScore
        });
      }
    }
    
    return contradictions;
  }

  
  calculateContradictionScore(claim1, claim2) {
    const contradictoryPatterns = [
      { positive: /\b(?:is|are|was|were)\b/gi, negative: /\b(?:is not|are not|was not|were not)\b/gi },
      { positive: /\b(?:always|never)\b/gi, negative: /\b(?:never|always)\b/gi },
      { positive: /\b(?:increase|grow|rise)\b/gi, negative: /\b(?:decrease|fall|drop)\b/gi }
    ];

    for (const pattern of contradictoryPatterns) {
      const posMatch1 = claim1.text.match(pattern.positive);
      const negMatch2 = claim2.text.match(pattern.negative);
      const posMatch2 = claim2.text.match(pattern.positive);
      const negMatch1 = claim1.text.match(pattern.negative);

      if ((posMatch1 && negMatch2) || (posMatch2 && negMatch1)) {
        return 0.9; // High contradiction
      }
    }

    return 0; // No contradiction detected
  }

  
  extractCitationContent(content) {

    const sentences = content.split(/[.!?]+/);
    

    let bestSentence = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > bestSentence.length && trimmed.length < 200) {
        bestSentence = trimmed;
      }
    }
    
    return bestSentence || content.substring(0, 150);
  }

  
  determineCitationType(evidence) {
    if (evidence.semanticTags && evidence.semanticTags.includes('results')) {
      return 'research_finding';
    } else if (evidence.semanticTags && evidence.semanticTags.includes('methodology')) {
      return 'methodology';
    } else if (evidence.semanticTags && evidence.semanticTags.includes('introduction')) {
      return 'background';
    } else {
      return 'general';
    }
  }

  
  calculateOverallConfidence(claims) {
    if (claims.length === 0) return 0.5;
    
    const avgConfidence = claims.reduce((sum, claim) => sum + claim.confidence, 0) / claims.length;
    const evidenceRatio = claims.filter(claim => claim.evidence.length > 0).length / claims.length;
    
    return (avgConfidence * 0.7) + (evidenceRatio * 0.3);
  }

  
  calculateGroundingScore(claims) {
    if (claims.length === 0) return 0;
    
    const claimsWithEvidence = claims.filter(claim => claim.evidence.length > 0);
    const avgEvidenceStrength = claimsWithEvidence.reduce((sum, claim) => sum + claim.evidenceStrength, 0) / claimsWithEvidence.length;
    
    return (claimsWithEvidence.length / claims.length) * avgEvidenceStrength;
  }

  
  trackGrounding(groundedResponse, query, context) {
    const trackingData = {
      timestamp: new Date().toISOString(),
      query: query.text,
      responseLength: groundedResponse.content.length,
      totalClaims: groundedResponse.claims.length,
      claimsWithEvidence: groundedResponse.claims.filter(c => c.evidence.length > 0).length,
      totalCitations: groundedResponse.citations.length,
      groundingScore: groundedResponse.grounding.groundingScore,
      hallucinationRisk: groundedResponse.hallucinationAnalysis.overallRisk,
      contextSize: context.length,
      avgRelevance: context.reduce((sum, chunk) => sum + (chunk.totalScore || 0), 0) / context.length
    };

    this.confidenceHistory.push(trackingData);
    

    if (this.confidenceHistory.length > 1000) {
      this.confidenceHistory = this.confidenceHistory.slice(-500);
    }
  }

  
  formatCitationsSection(citations) {
    if (citations.length === 0) return '';
    
    return `
## Sources

${citations.map(citation => `
### [${citation.index}] ${citation.title}

**Source:** ${citation.source}
**Relevance:** ${(citation.confidence * 100).toFixed(1)}%
**Type:** ${citation.type}

> ${citation.content}

---
`).join('')}
    `.trim();
  }

  
  formatEvidenceSection(claims) {
    const claimsWithEvidence = claims.filter(claim => claim.evidence.length > 0);
    
    if (claimsWithEvidence.length === 0) return '';
    
    return `
## Evidence Analysis

${claimsWithEvidence.map(claim => `
### Claim: "${claim.text}"

**Confidence:** ${(claim.confidence * 100).toFixed(1)}%
**Evidence Strength:** ${(claim.evidenceStrength * 100).toFixed(1)}%

**Supporting Evidence:**
${claim.evidence.map(ev => `- ${ev.source} (${(ev.relevance * 100).toFixed(1)}% relevance)`).join('\n')}

---
`).join('')}
    `.trim();
  }

  
  formatConfidenceSection(confidence) {
    return `
## Response Confidence

**Overall Confidence:** ${(confidence * 100).toFixed(1)}%

**Confidence Level:** ${this.getConfidenceLevel(confidence)}

**Interpretation:** ${this.getConfidenceInterpretation(confidence)}
    `.trim();
  }

  
  formatWarningsSection(analysis) {
    if (analysis.overallRisk === 'low') return '';
    
    return `
## ⚠️ Response Warnings

**Overall Risk Level:** ${analysis.overallRisk.toUpperCase()}

**Issues Detected:**
- ${analysis.hallucinatedClaims.length} potentially hallucinated claims
- ${analysis.lowConfidenceClaims.length} low-confidence claims
- ${analysis.contradictoryClaims.length} contradictory claims

**Recommendation:** ${this.getRiskRecommendation(analysis.overallRisk)}
    `.trim();
  }

  
  getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'HIGH';
    if (confidence >= 0.6) return 'MEDIUM';
    if (confidence >= 0.4) return 'LOW';
    return 'VERY LOW';
  }

  
  getConfidenceInterpretation(confidence) {
    if (confidence >= 0.8) {
      return 'Response is well-supported by retrieved evidence and sources.';
    } else if (confidence >= 0.6) {
      return 'Response has moderate evidence support with some uncertainty.';
    } else if (confidence >= 0.4) {
      return 'Response has limited evidence support and should be verified.';
    } else {
      return 'Response has minimal evidence support and may contain inaccuracies.';
    }
  }

  
  getRiskRecommendation(riskLevel) {
    switch (riskLevel) {
      case 'high':
        return 'Verify all claims independently before using this information.';
      case 'medium':
        return 'Cross-reference claims with additional sources.';
      case 'low':
        return 'Generally reliable, but verification recommended for critical information.';
      default:
        return 'Response appears reliable.';
    }
  }

  
  calculateSemanticBoost(claim, chunk) {
    const claimTags = new Set(); // Would be extracted from claim
    const chunkTags = new Set(chunk.semanticTags || []);
    

    const overlap = [...claimTags].filter(tag => chunkTags.has(tag)).length;
    return chunkTags.size > 0 ? overlap / chunkTags.size * 0.1 : 0;
  }

  
  calculateDistanceBoost(claim, chunk) {

    const distance = Math.abs((claim.position || 0) - (chunk.position || 0));
    return Math.max(0, 1 - distance / this.config.maxGroundingDistance) * 0.1;
  }

  
  generateInteractiveElements(groundedResponse) {
    return {
      citationTooltips: groundedResponse.citations.map(citation => ({
        id: citation.id,
        content: `
          <div class="citation-tooltip">
            <h4>${citation.title}</h4>
            <p><strong>Source:</strong> ${citation.source}</p>
            <p><strong>Relevance:</strong> ${(citation.confidence * 100).toFixed(1)}%</p>
            <p><strong>Content:</strong> ${citation.content}</p>
          </div>
        `
      })),
      expandableEvidence: groundedResponse.claims.map(claim => ({
        claimId: claim.id,
        evidence: claim.evidence
      }))
    };
  }

  
  getStats() {
    return {
      config: this.config,
      trackingData: this.confidenceHistory.slice(-100), // Last 100 entries
      averageConfidence: this.confidenceHistory.length > 0 
        ? this.confidenceHistory.reduce((sum, entry) => sum + entry.groundingScore, 0) / this.confidenceHistory.length
        : 0,
      capabilities: [
        'source citation system',
        'evidence references',
        'chunk traceability',
        'retrieval grounding',
        'confidence indicators',
        'hallucination detection',
        'answer provenance',
        'structured formatting',
        'interactive citations'
      ]
    };
  }

  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  
  reset() {
    this.citationTracker.clear();
    this.evidenceMap.clear();
    this.confidenceHistory = [];
    this.hallucinationPatterns.clear();
  }
}

export const responseGrounding = new ResponseGrounding();

export const groundResponse = responseGrounding.groundResponse.bind(responseGrounding);
export const getStats = responseGrounding.getStats.bind(responseGrounding);
export const updateConfig = responseGrounding.updateConfig.bind(responseGrounding);
export const reset = responseGrounding.reset.bind(responseGrounding);

export default responseGrounding;
