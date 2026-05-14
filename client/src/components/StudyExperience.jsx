import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Eye, EyeOff, Highlighter, Lightbulb, CheckCircle, Clock, Target, Zap, Brain, FileText, Layers, Award, ChevronDown, ChevronRight, Play, Pause, RotateCcw, Bookmark } from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';
const StudyExperience = ({
  content = '',
  title = '',
  className = '',
  enableFocusMode = true,
  enableInsights = true,
  enableCheckpoints = true
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [highlightedSections, setHighlightedSections] = useState(new Set());
  const [insights, setInsights] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [studyProgress, setStudyProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState(new Set());
  const [studySession] = useExtensionState('studySession', {
    storage: 'session'
  });
  const [studyStats] = useExtensionState('studyStats', {
    storage: 'persistent'
  });
  const {
    addToast
  } = useGlobalStatus();
  const sections = useMemo(() => {
    return parseContentIntoSections(content);
  }, [content]);
  const keyConcepts = useMemo(() => {
    return extractKeyConcepts(content);
  }, [content]);
  const studyMetrics = useMemo(() => {
    return calculateStudyMetrics(sections, highlightedSections, readingTime);
  }, [sections, highlightedSections, readingTime]);
  useEffect(() => {
    if (enableInsights && content) {
      generateInsights();
    }
  }, [content, enableInsights]);
  useEffect(() => {
    if (enableCheckpoints && sections.length > 0) {
      generateCheckpoints();
    }
  }, [sections, enableCheckpoints]);
  useEffect(() => {
    let interval;
    if (isStudying) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);
  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(!isFocusMode);
    addToast({
      type: 'info',
      title: isFocusMode ? 'Focus Mode Disabled' : 'Focus Mode Enabled',
      message: isFocusMode ? ' distractions are now visible' : ' distractions hidden for better focus',
      duration: 2000
    });
  }, [isFocusMode, addToast]);
  const toggleHighlight = useCallback(sectionId => {
    setHighlightedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);
  const toggleStudy = useCallback(() => {
    setIsStudying(!isStudying);
    if (!isStudying) {
      addToast({
        type: 'success',
        title: 'Study Session Started',
        message: 'Tracking your reading progress and time',
        duration: 2000
      });
    } else {
      addToast({
        type: 'info',
        title: 'Study Session Paused',
        message: 'Your progress has been saved',
        duration: 2000
      });
    }
  }, [isStudying, addToast]);
  const toggleInsight = useCallback(insightId => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  }, []);
  const completeCheckpoint = useCallback(checkpointId => {
    setCheckpoints(prev => prev.map(cp => cp.id === checkpointId ? {
      ...cp,
      completed: true
    } : cp));
    const completedCount = checkpoints.filter(cp => cp.completed).length + 1;
    setStudyProgress(completedCount / checkpoints.length * 100);
    addToast({
      type: 'success',
      title: 'Checkpoint Completed',
      message: 'Great progress! Keep going.',
      duration: 2000
    });
  }, [checkpoints, addToast]);
  const generateInsights = useCallback(async () => {
    try {
      const mockInsights = [{
        id: 'insight_1',
        type: 'key_concept',
        title: 'Core Concept',
        description: 'The main idea revolves around understanding the fundamental principles',
        explanation: 'This concept is essential because it forms the foundation for more advanced topics',
        importance: 'high',
        relatedConcepts: keyConcepts.slice(0, 3)
      }, {
        id: 'insight_2',
        type: 'practical_application',
        title: 'Real-World Application',
        description: 'This knowledge can be applied in practical scenarios',
        explanation: 'Understanding this helps bridge theory and practice',
        importance: 'medium',
        examples: ['Case study example', 'Industry application', 'Research implications']
      }, {
        id: 'insight_3',
        type: 'study_tip',
        title: 'Study Strategy',
        description: 'Focus on understanding relationships between concepts',
        explanation: 'Creating mental maps helps retain information better',
        importance: 'medium',
        techniques: ['Visual learning', 'Active recall', 'Spaced repetition']
      }];
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  }, [keyConcepts]);
  const generateCheckpoints = useCallback(() => {
    const mockCheckpoints = sections.slice(0, 5).map((section, index) => ({
      id: `checkpoint_${index}`,
      title: `Checkpoint ${index + 1}`,
      description: `Review and understand ${section.title}`,
      sectionId: section.id,
      completed: false,
      estimatedTime: Math.ceil(section.content.length / 100)
    }));
    setCheckpoints(mockCheckpoints);
  }, [sections]);
  const renderFocusModeToggle = () => {
    if (!enableFocusMode) return null;
    return <button onClick={toggleFocusMode} className={`focus-mode-toggle ${isFocusMode ? 'active' : ''}`} title={isFocusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}>
        {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
      </button>;
  };
  const renderStudyControls = () => {
    return <div className="study-controls">
        <button onClick={toggleStudy} className={`study-toggle ${isStudying ? 'active' : ''}`}>
          {isStudying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isStudying ? 'Pause' : 'Start Study'}</span>
        </button>

        <div className="study-metrics">
          <div className="metric">
            <Clock className="w-4 h-4" />
            <span>{formatTime(readingTime)}</span>
          </div>

          <div className="metric">
            <Target className="w-4 h-4" />
            <span>{studyProgress.toFixed(0)}%</span>
          </div>

          <div className="metric">
            <BookOpen className="w-4 h-4" />
            <span>{highlightedSections.size} highlighted</span>
          </div>
        </div>
      </div>;
  };
  const renderContentSections = () => {
    return sections.map((section, index) => {
      const isHighlighted = highlightedSections.has(section.id);
      const hasCheckpoint = checkpoints.some(cp => cp.sectionId === section.id);
      const completedCheckpoint = checkpoints.find(cp => cp.sectionId === section.id && cp.completed);
      return <div key={section.id} className={`content-section ${isHighlighted ? 'highlighted' : ''} ${isFocusMode ? 'focus-mode' : ''}`}>
          <div className="section-header">
            <h3 className="section-title">{section.title}</h3>

            <div className="section-actions">
              {hasCheckpoint && <div className={`checkpoint-indicator ${completedCheckpoint ? 'completed' : ''}`}>
                  {completedCheckpoint ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                </div>}

              <button onClick={() => toggleHighlight(section.id)} className={`highlight-btn ${isHighlighted ? 'active' : ''}`} title={isHighlighted ? 'Remove highlight' : 'Highlight section'}>
                <Highlighter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="section-content">
            {section.content}
          </div>

          {isHighlighted && <div className="section-insights">
              <div className="insights-header">
                <Lightbulb className="w-4 h-4" />
                <span>Key Insights</span>
              </div>

              <div className="insights-list">
                {insights.filter(insight => insight.importance === 'high' || insight.type === 'key_concept').slice(0, 2).map(insight => <div key={insight.id} className="insight-item">
                      <div className="insight-title">{insight.title}</div>
                      <div className="insight-description">{insight.description}</div>
                    </div>)}
              </div>
            </div>}
        </div>;
    });
  };
  const renderInsightsPanel = () => {
    if (!enableInsights || insights.length === 0) return null;
    return <div className="insights-panel">
        <div className="panel-header">
          <Brain className="w-5 h-5" />
          <h3>AI-Generated Insights</h3>
        </div>

        <div className="insights-grid">
          {insights.map(insight => <div key={insight.id} className={`insight-card ${insight.importance}`} onClick={() => toggleInsight(insight.id)}>
              <div className="insight-header">
                <div className="insight-icon">
                  {insight.type === 'key_concept' && <Zap className="w-4 h-4" />}
                  {insight.type === 'practical_application' && <Target className="w-4 h-4" />}
                  {insight.type === 'study_tip' && <Lightbulb className="w-4 h-4" />}
                </div>
                <h4 className="insight-title">{insight.title}</h4>
                <ChevronDown className={`w-4 h-4 chevron ${expandedInsights.has(insight.id) ? 'expanded' : ''}`} />
              </div>

              <p className="insight-description">{insight.description}</p>

              {expandedInsights.has(insight.id) && <div className="insight-expanded">
                  <div className="insight-explanation">
                    <h5>Explanation:</h5>
                    <p>{insight.explanation}</p>
                  </div>

                  {insight.relatedConcepts && <div className="related-concepts">
                      <h5>Related Concepts:</h5>
                      <div className="concept-tags">
                        {insight.relatedConcepts.map((concept, index) => <span key={index} className="concept-tag">{concept}</span>)}
                      </div>
                    </div>}

                  {insight.examples && <div className="examples">
                      <h5>Examples:</h5>
                      <ul>
                        {insight.examples.map((example, index) => <li key={index}>{example}</li>)}
                      </ul>
                    </div>}

                  {insight.techniques && <div className="techniques">
                      <h5>Study Techniques:</h5>
                      <ul>
                        {insight.techniques.map((technique, index) => <li key={index}>{technique}</li>)}
                      </ul>
                    </div>}
                </div>}
            </div>)}
        </div>
      </div>;
  };
  const renderCheckpointsPanel = () => {
    if (!enableCheckpoints || checkpoints.length === 0) return null;
    return <div className="checkpoints-panel">
        <div className="panel-header">
          <Award className="w-5 h-5" />
          <h3>Study Checkpoints</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{
            width: `${studyProgress}%`
          }} />
          </div>
        </div>

        <div className="checkpoints-list">
          {checkpoints.map((checkpoint, index) => <div key={checkpoint.id} className={`checkpoint-item ${checkpoint.completed ? 'completed' : ''} ${currentCheckpoint === index ? 'current' : ''}`}>
              <div className="checkpoint-header">
                <div className="checkpoint-number">{index + 1}</div>
                <div className="checkpoint-info">
                  <h4 className="checkpoint-title">{checkpoint.title}</h4>
                  <p className="checkpoint-description">{checkpoint.description}</p>
                </div>
                <div className="checkpoint-actions">
                  {checkpoint.completed ? <CheckCircle className="w-5 h-5 completed-icon" /> : <button onClick={() => completeCheckpoint(checkpoint.id)} className="complete-btn" title="Mark as complete">
                      <Target className="w-4 h-4" />
                    </button>}
                </div>
              </div>

              <div className="checkpoint-meta">
                <span className="estimated-time">
                  <Clock className="w-3 h-3" />
                  ~{checkpoint.estimatedTime} min
                </span>
              </div>
            </div>)}
        </div>
      </div>;
  };
  const renderConceptBreakdown = () => {
    if (keyConcepts.length === 0) return null;
    return <div className="concept-breakdown">
        <div className="panel-header">
          <Layers className="w-5 h-5" />
          <h3>Key Concepts</h3>
        </div>

        <div className="concepts-grid">
          {keyConcepts.map((concept, index) => <div key={index} className="concept-card">
              <div className="concept-header">
                <h4 className="concept-name">{concept.name}</h4>
                <span className="concept-frequency">{concept.frequency} mentions</span>
              </div>

              <p className="concept-description">{concept.description}</p>

              {concept.related && <div className="related-concepts">
                  <span className="related-label">Related:</span>
                  {concept.related.slice(0, 3).map((related, i) => <span key={i} className="related-concept">{related}</span>)}
                </div>}
            </div>)}
        </div>
      </div>;
  };
  const renderStudySummary = () => {
    if (!isStudying && readingTime === 0) return null;
    return <div className="study-summary">
        <div className="summary-header">
          <FileText className="w-5 h-5" />
          <h3>Study Session Summary</h3>
        </div>

        <div className="summary-metrics">
          <div className="metric-card">
            <div className="metric-value">{formatTime(readingTime)}</div>
            <div className="metric-label">Reading Time</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{highlightedSections.size}</div>
            <div className="metric-label">Sections Highlighted</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{studyProgress.toFixed(0)}%</div>
            <div className="metric-label">Progress</div>
          </div>

          <div className="metric-card">
            <div className="metric-value">{checkpoints.filter(cp => cp.completed).length}</div>
            <div className="metric-label">Checkpoints Completed</div>
          </div>
        </div>

        <div className="summary-actions">
          <button className="action-btn primary">
            <Bookmark className="w-4 h-4" />
            Save Session
          </button>

          <button className="action-btn secondary">
            <RotateCcw className="w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>;
  };
  return <div className={`study-experience ${isFocusMode ? 'focus-mode' : ''} ${className}`}>

      <div className="study-header">
        <div className="header-content">
          <h1 className="study-title">{title}</h1>
          <p className="study-subtitle">
            {sections.length} sections • {keyConcepts.length} key concepts
          </p>
        </div>

        <div className="header-actions">
          {renderFocusModeToggle()}
          {renderStudyControls()}
        </div>
      </div>

      <div className="study-content">
        <div className="content-main">
          {renderContentSections()}
        </div>

        <div className="content-sidebar">
          {renderInsightsPanel()}
          {renderCheckpointsPanel()}
          {renderConceptBreakdown()}
          {renderStudySummary()}
        </div>
      </div>
    </div>;
};
const parseContentIntoSections = content => {
  if (!content) return [];
  const sections = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let lastIndex = 0;
  let sectionIndex = 0;
  while ((match = headingRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const sectionContent = content.substring(lastIndex, match.index).trim();
      if (sectionContent) {
        sections.push({
          id: `section_${sectionIndex++}`,
          title: 'Introduction',
          content: sectionContent,
          level: 0
        });
      }
    }
    lastIndex = headingRegex.lastIndex;
  }
  if (lastIndex < content.length) {
    const lastContent = content.substring(lastIndex).trim();
    if (lastContent) {
      sections.push({
        id: `section_${sectionIndex}`,
        title: 'Conclusion',
        content: lastContent,
        level: 0
      });
    }
  }
  return sections;
};
const extractKeyConcepts = content => {
  if (!content) return [];
  const conceptPatterns = [/\b(?:research|study|analysis|investigation)\b/gi, /\b(?:technology|science|medicine|education)\b/gi, /\b(?:policy|economy|business|market)\b/gi, /\b(?:data|information|knowledge|learning)\b/gi];
  const conceptCounts = new Map();
  for (const pattern of conceptPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const concept = match.toLowerCase();
        conceptCounts.set(concept, (conceptCounts.get(concept) || 0) + 1);
      });
    }
  }
  return Array.from(conceptCounts.entries()).map(([name, frequency]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    frequency,
    description: `Important concept mentioned ${frequency} times`,
    related: []
  })).sort((a, b) => b.frequency - a.frequency).slice(0, 8);
};
const calculateStudyMetrics = (sections, highlightedSections, readingTime) => {
  return {
    sectionsRead: highlightedSections.size,
    totalSections: sections.length,
    readingSpeed: readingTime > 0 ? Math.round(sections.reduce((sum, s) => sum + s.content.length, 0) / readingTime * 60) : 0,
    completionRate: sections.length > 0 ? highlightedSections.size / sections.length * 100 : 0
  };
};
const formatTime = seconds => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
export default StudyExperience;
