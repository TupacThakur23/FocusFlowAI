

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Eye,
  EyeOff,
  Copy,
  Star,
  Clock,
  FileText,
  Globe,
  User,
  Shield
} from 'lucide-react';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';

const CitationViewer = ({ 
  citations = [], 
  evidence = [], 
  confidence = 0, 
  onCitationClick,
  className = '',
  showTransparency = true,
  compact = false 
}) => {

  const [expandedCitations, setExpandedCitations] = useState(new Set());
  const [showEvidence, setShowEvidence] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(null);
  const { addToast } = useGlobalStatus();

  const confidenceLevel = useMemo(() => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    if (confidence >= 0.4) return 'low';
    return 'very_low';
  }, [confidence]);

  const confidenceColor = useMemo(() => {
    switch (confidenceLevel) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      case 'very_low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [confidenceLevel]);

  const confidenceLabel = useMemo(() => {
    switch (confidenceLevel) {
      case 'high': return 'High Confidence';
      case 'medium': return 'Medium Confidence';
      case 'low': return 'Low Confidence';
      case 'very_low': return 'Very Low Confidence';
      default: return 'Unknown';
    }
  }, [confidenceLevel]);

  const toggleCitation = useCallback((citationId) => {
    setExpandedCitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(citationId)) {
        newSet.delete(citationId);
      } else {
        newSet.add(citationId);
      }
      return newSet;
    });
  }, []);

  const copyCitation = useCallback((citation) => {
    const citationText = `${citation.title}\n${citation.source}\n${citation.content}`;
    
    navigator.clipboard.writeText(citationText).then(() => {
      setCopiedCitation(citation.id);
      addToast({
        type: 'success',
        title: 'Citation Copied',
        message: 'Citation copied to clipboard',
        duration: 2000
      });
      
      setTimeout(() => setCopiedCitation(null), 2000);
    }).catch(() => {
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy citation',
        duration: 3000
      });
    });
  }, [addToast]);

  const openSource = useCallback((source) => {
    if (source) {
      window.open(source, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const renderConfidenceIndicator = () => {
    if (!showTransparency) return null;

    return (
      <div className="confidence-indicator">
        <div className="confidence-header">
          <Shield className={`w-4 h-4 ${confidenceColor}`} />
          <span className={`confidence-label ${confidenceColor}`}>
            {confidenceLabel}
          </span>
          <span className="confidence-score">
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="confidence-bar">
          <div 
            className={`confidence-fill ${confidenceLevel}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        
        {confidenceLevel === 'low' || confidenceLevel === 'very_low' ? (
          <div className="confidence-warning">
            <AlertCircle className="w-3 h-3" />
            <span>This answer has low confidence - verify with additional sources</span>
          </div>
        ) : null}
      </div>
    );
  };

  const renderTransparencyExplanation = () => {
    if (!showTransparency || citations.length === 0) return null;

    return (
      <div className="transparency-explanation">
        <div className="explanation-header">
          <Info className="w-4 h-4" />
          <span>Why this answer</span>
        </div>
        
        <div className="explanation-content">
          <p>This response is based on {citations.length} source{citations.length !== 1 ? 's' : ''}:</p>
          
          <ul className="source-list">
            {citations.slice(0, 3).map((citation, index) => (
              <li key={citation.id}>
                <span className="source-title">{citation.title}</span>
                {citation.relevance && (
                  <span className="source-relevance">
                    ({(citation.relevance * 100).toFixed(0)}% match)
                  </span>
                )}
              </li>
            ))}
            {citations.length > 3 && (
              <li className="more-sources">
                and {citations.length - 3} more source{citations.length - 4 !== 0 ? 's' : ''}
              </li>
            )}
          </ul>
          
          {evidence.length > 0 && (
            <div className="evidence-summary">
              <span className="evidence-count">
                {evidence.length} piece{evidence.length !== 1 ? 's' : ''} of supporting evidence
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCitation = (citation) => {
    const isExpanded = expandedCitations.has(citation.id);
    const isCopied = copiedCitation === citation.id;

    return (
      <div 
        key={citation.id}
        className={`citation-item ${isExpanded ? 'expanded' : ''} ${compact ? 'compact' : ''}`}
      >
        <div className="citation-header" onClick={() => toggleCitation(citation.id)}>
          <div className="citation-info">
            <div className="citation-number">[{citation.index || citation.id}]</div>
            <div className="citation-title">
              <h4>{citation.title}</h4>
              {citation.type && (
                <span className="citation-type">{citation.type}</span>
              )}
            </div>
          </div>
          
          <div className="citation-actions">
            {citation.source && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openSource(citation.source);
                }}
                className="citation-action-btn"
                title="Open source"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyCitation(citation);
              }}
              className={`citation-action-btn ${isCopied ? 'copied' : ''}`}
              title={isCopied ? 'Copied!' : 'Copy citation'}
            >
              {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            
            <button
              className="citation-expand-btn"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="citation-expanded">
            <div className="citation-content">
              <div className="citation-excerpt">
                <FileText className="w-4 h-4" />
                <span>{citation.content || citation.excerpt}</span>
              </div>
              
              <div className="citation-metadata">
                {citation.source && (
                  <div className="metadata-item">
                    <Globe className="w-3 h-3" />
                    <a 
                      href={citation.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      {new URL(citation.source).hostname}
                    </a>
                  </div>
                )}
                
                {citation.timestamp && (
                  <div className="metadata-item">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(citation.timestamp)}</span>
                  </div>
                )}
                
                {citation.author && (
                  <div className="metadata-item">
                    <User className="w-3 h-3" />
                    <span>{citation.author}</span>
                  </div>
                )}
                
                {citation.relevance && (
                  <div className="metadata-item">
                    <Star className="w-3 h-3" />
                    <span>Relevance: {(citation.relevance * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              
              {citation.confidence && (
                <div className="citation-confidence">
                  <span className="confidence-label">Source Confidence:</span>
                  <div className="confidence-mini-bar">
                    <div 
                      className="confidence-mini-fill"
                      style={{ width: `${citation.confidence * 100}%` }}
                    />
                  </div>
                  <span className="confidence-score">
                    {(citation.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEvidenceSection = () => {
    if (evidence.length === 0) return null;

    return (
      <div className="evidence-section">
        <div className="evidence-header" onClick={() => setShowEvidence(!showEvidence)}>
          <Eye className="w-4 h-4" />
          <span>Supporting Evidence ({evidence.length})</span>
          <button className="evidence-toggle-btn">
            {showEvidence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        
        {showEvidence && (
          <div className="evidence-list">
            {evidence.map((evidenceItem, index) => (
              <div key={index} className="evidence-item">
                <div className="evidence-number">E{index + 1}</div>
                <div className="evidence-content">
                  <div className="evidence-text">{evidenceItem.content}</div>
                  <div className="evidence-source">
                    from {evidenceItem.source || 'Unknown source'}
                  </div>
                </div>
                {evidenceItem.confidence && (
                  <div className="evidence-confidence">
                    {(evidenceItem.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`citation-viewer compact ${className}`}>
        <div className="compact-citations">
          {citations.slice(0, 3).map((citation, index) => (
            <span key={citation.id} className="compact-citation">
              [{index + 1}]
            </span>
          ))}
          {citations.length > 3 && (
            <span className="compact-citation">
              +{citations.length - 3} more
            </span>
          )}
        </div>
        
        {showTransparency && (
          <div className="compact-confidence">
            <Shield className={`w-3 h-3 ${confidenceColor}`} />
            <span className={confidenceColor}>
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`citation-viewer ${className}`}>
      
      {renderConfidenceIndicator()}
      
      
      {renderTransparencyExplanation()}
      
      
      {citations.length > 0 && (
        <div className="citations-section">
          <div className="section-header">
            <h3>Sources ({citations.length})</h3>
            <span className="section-subtitle">
              Click to expand and explore sources
            </span>
          </div>
          
          <div className="citations-list">
            {citations.map(renderCitation)}
          </div>
        </div>
      )}
      
      
      {renderEvidenceSection()}
      
      
      {citations.length === 0 && showTransparency && (
        <div className="no-sources-warning">
          <AlertCircle className="w-5 h-5" />
          <div className="warning-content">
            <h4>No sources provided</h4>
            <p>This response doesn't include source citations. Verify the information independently.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default CitationViewer;
