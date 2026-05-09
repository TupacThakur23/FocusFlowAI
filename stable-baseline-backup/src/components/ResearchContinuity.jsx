/**
 * ResearchContinuity - UX Component for Connected Research Suggestions
 * 
 * Provides intelligent research continuity features:
 * - Related research suggestions
 * - Connected notes panel
 * - "Continue research" section
 * - Semantic breadcrumbs
 * - Linked topic suggestions
 * - Source relationship indicators
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Link2, 
  TrendingUp, 
  ArrowRight, 
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Bookmark,
  RefreshCw,
  Lightbulb,
  GitBranch,
  Users,
  Calendar,
  Tag,
  ExternalLink
} from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';

const ResearchContinuity = ({ 
  className = '', 
  maxSuggestions = 8,
  maxRelatedTopics = 5,
  enableAutoRefresh = true 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('suggestions');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  // Extension integration
  const [recentTopics] = useExtensionState('recentTopics', { storage: 'session' });
  const [activeWorkbooks] = useExtensionState('activeWorkbooks', { storage: 'session' });
  const [researchThreads] = useExtensionState('researchThreads', { storage: 'session' });
  const { addToast } = useGlobalStatus();

  // Computed data
  const suggestions = useMemo(() => {
    const allSuggestions = [];

    // Add continue research suggestions
    const continueSuggestions = generateContinueSuggestions(recentTopics, researchThreads);
    allSuggestions.push(...continueSuggestions);

    // Add related topic suggestions
    const relatedSuggestions = generateRelatedSuggestions(recentTopics, activeWorkbooks);
    allSuggestions.push(...relatedSuggestions);

    // Add workbook suggestions
    const workbookSuggestions = generateWorkbookSuggestions(activeWorkbooks);
    allSuggestions.push(...workbookSuggestions);

    // Add connection suggestions
    const connectionSuggestions = generateConnectionSuggestions(recentTopics, researchThreads);
    allSuggestions.push(...connectionSuggestions);

    // Filter and sort suggestions
    return filterAndSortSuggestions(allSuggestions, searchQuery, filterType, sortBy);
  }, [recentTopics, activeWorkbooks, researchThreads, searchQuery, filterType, sortBy]);

  // Generate continue research suggestions with intelligent continuity
  const generateContinueSuggestions = useCallback((topics, threads) => {
    const suggestions = [];
    
    // Smart continuation based on session context
    const sessionContext = getSessionContext();
    const currentTime = Date.now();
    
    // Get most recent topic with intelligent weighting
    const recentTopic = topics?.[0];
    if (recentTopic) {
      const timeSinceAccess = currentTime - recentTopic.lastAccessed;
      const isVeryRecent = timeSinceAccess < 5 * 60 * 1000; // 5 minutes
      const isRecentlyActive = timeSinceAccess < 30 * 60 * 1000; // 30 minutes
      
      // Only show if contextually relevant
      if (isVeryRecent || (isRecentlyActive && recentTopic.frequency > 1)) {
        suggestions.push({
          id: 'continue_recent',
          type: 'continue',
          priority: isVeryRecent ? 'critical' : 'high',
          title: isVeryRecent ? 'Continue Research' : 'Resume Research',
          description: isVeryRecent 
            ? `Continue exploring "${recentTopic.topic}"`
            : `Pick up where you left off with "${recentTopic.topic}"`,
          icon: <Clock className="w-4 h-4" />,
          action: 'continue',
          data: recentTopic,
          metadata: {
            lastAccessed: recentTopic.lastAccessed,
            frequency: recentTopic.frequency,
            relevance: recentTopic.relevance,
            timeSinceAccess,
            isVeryRecent
          }
        });
      }
    }

    // Intelligent thread continuation based on activity patterns
    const activeThreads = threads?.filter(thread => thread.status === 'active');
    const prioritizedThreads = activeThreads
      ?.map(thread => ({
        ...thread,
        priorityScore: calculateThreadPriority(thread, currentTime)
      }))
      ?.sort((a, b) => b.priorityScore - a.priorityScore)
      ?.slice(0, 2);

    prioritizedThreads?.forEach(thread => {
      const isUrgent = thread.priorityScore > 0.8;
      const hasRecentActivity = currentTime - thread.lastActivity < 10 * 60 * 1000;
      
      suggestions.push({
        id: `continue_thread_${thread.id}`,
        type: 'continue',
        priority: isUrgent ? 'critical' : 'high',
        title: isUrgent ? 'Active Research' : `Continue "${thread.topic}"`,
        description: hasRecentActivity 
          ? `Resume active research on ${thread.topic}`
          : `Continue your research on ${thread.topic}`,
        icon: <BookOpen className="w-4 h-4" />,
        action: 'continue_thread',
        data: thread,
        metadata: {
          messages: thread.messages.length,
          lastActivity: thread.lastActivity,
          duration: Date.now() - thread.startTime,
          priorityScore: thread.priorityScore,
          isUrgent,
          hasRecentActivity
        }
      });
    });

    return suggestions;
  }, [topics, threads]);

  // Generate related suggestions
  const generateRelatedSuggestions = useCallback((topics, workbooks) => {
    const suggestions = [];
    
    // Related topics from recent research
    if (topics && topics.length > 1) {
      const relatedTopics = findRelatedTopics(topics[0], topics.slice(1));
      relatedTopics.slice(0, 3).forEach((topic, index) => {
        suggestions.push({
          id: `related_topic_${index}`,
          type: 'related',
          priority: 'medium',
          title: `Explore "${topic.topic}"`,
          description: `Related to your recent research on ${topics[0].topic}`,
          icon: <TrendingUp className="w-4 h-4" />,
          action: 'explore',
          data: topic,
          metadata: {
            similarity: topic.similarity,
            sharedTags: topic.sharedTags,
            connectionType: topic.connectionType
          }
        });
      });
    }

    // Related workbooks
    if (workbooks && workbooks.length > 0) {
      workbooks.slice(0, 2).forEach((workbook, index) => {
        suggestions.push({
          id: `related_workbook_${index}`,
          type: 'workbook',
          priority: 'medium',
          title: `Review "${workbook.title}"`,
          description: `Connected research in your ${workbook.title} workbook`,
          icon: <Bookmark className="w-4 h-4" />,
          action: 'open_workbook',
          data: workbook,
          metadata: {
            accessCount: workbook.accessCount,
            lastAccessed: workbook.lastAccessed,
            topicCount: workbook.topics?.length || 0
          }
        });
      });
    }

    return suggestions;
  }, [topics, workbooks]);

  // Generate workbook suggestions
  const generateWorkbookSuggestions = useCallback((workbooks) => {
    const suggestions = [];
    
    // Most accessed workbooks
    const mostAccessed = workbooks
      ?.sort((a, b) => b.accessCount - a.accessCount)
      ?.slice(0, 2);

    mostAccessed?.forEach((workbook, index) => {
      suggestions.push({
        id: `workbook_access_${index}`,
        type: 'workbook_access',
        priority: 'medium',
        title: workbook.title,
        description: `${workbook.accessCount} recent accesses`,
        icon: <Star className="w-4 h-4" />,
        action: 'open_workbook',
        data: workbook,
        metadata: {
          accessCount: workbook.accessCount,
          lastAccessed: workbook.lastAccessed,
          type: workbook.type
        }
      });
    });

    return suggestions;
  }, [workbooks]);

  // Generate connection suggestions
  const generateConnectionSuggestions = useCallback((topics, threads) => {
    const suggestions = [];
    
    // Find concept connections
    const conceptConnections = findConceptConnections(topics, threads);
    conceptConnections.slice(0, 2).forEach((connection, index) => {
      suggestions.push({
        id: `concept_connection_${index}`,
        type: 'connection',
        priority: 'low',
        title: `Explore "${connection.concept}"`,
        description: `Connected through ${connection.via}`,
        icon: <GitBranch className="w-4 h-4" />,
        action: 'explore_concept',
        data: connection,
        metadata: {
          connectionStrength: connection.strength,
          sharedTopics: connection.sharedTopics,
          via: connection.via
        }
      });
    });

    return suggestions;
  }, [topics, threads]);

  // Find related topics
  const findRelatedTopics = useCallback((primaryTopic, otherTopics) => {
    const primaryWords = new Set(primaryTopic.topic.toLowerCase().split(/\s+/));
    
    return otherTopics
      .map(topic => ({
        ...topic,
        similarity: calculateTopicSimilarity(primaryTopic.topic, topic.topic),
        sharedTags: findSharedTags(primaryTopic.semanticTags || [], topic.semanticTags || []),
        connectionType: determineConnectionType(primaryTopic, topic)
      }))
      .filter(topic => topic.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity);
  }, []);

  // Find concept connections
  const findConceptConnections = useCallback((topics, threads) => {
    const connections = [];
    const allTopics = [...(topics || []), ...(threads?.map(t => ({ topic: t.topic, semanticTags: t.semanticTags })) || [])];
    
    // Find concept clusters
    const conceptClusters = groupByConcept(allTopics);
    
    for (const [concept, cluster] of conceptClusters.entries()) {
      if (cluster.length > 1) {
        // Find strongest connection
        const strongestConnection = cluster.reduce((strongest, current) => {
          const currentStrength = calculateConnectionStrength(current, cluster);
          const strongestStrength = calculateConnectionStrength(strongest, cluster);
          return strongestStrength > currentStrength ? current : strongest;
        });

        connections.push({
          concept,
          strength: strongestConnection.strength,
          sharedTopics: cluster.map(t => t.topic),
          via: strongestConnection.topic
        });
      }
    }

    return connections;
  }, [topics, threads]);

  // Calculate topic similarity
  const calculateTopicSimilarity = useCallback((topic1, topic2) => {
    const words1 = new Set(topic1.toLowerCase().split(/\s+/));
    const words2 = new Set(topic2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }, []);

  // Find shared tags
  const findSharedTags = useCallback((tags1, tags2) => {
    const set1 = new Set(tags1 || []);
    const set2 = new Set(tags2 || []);
    const intersection = new Set([...set1].filter(tag => set2.has(tag)));
    return Array.from(intersection);
  }, []);

  // Determine connection type
  const determineConnectionType = useCallback((topic1, topic2) => {
    const tags1 = topic1.semanticTags || [];
    const tags2 = topic2.semanticTags || [];
    
    if (tags1.some(tag => tags2.includes(tag))) {
      return 'semantic';
    } else if (topic1.workbookId === topic2.workbookId) {
      return 'workbook';
    } else {
      return 'temporal';
    }
  }, []);

  // Group by concept
  const groupByConcept = useCallback((topics) => {
    const groups = new Map();
    
    for (const topic of topics) {
      const concepts = topic.semanticTags || [];
      
      for (const concept of concepts) {
        if (!groups.has(concept)) {
          groups.set(concept, []);
        }
        groups.get(concept).push(topic);
      }
    }
    
    return groups;
  }, []);

  // Calculate connection strength
  const calculateConnectionStrength = useCallback((topic, cluster) => {
    const sharedTags = cluster.reduce((count, other) => {
      const tags1 = topic.semanticTags || [];
      const tags2 = other.semanticTags || [];
      const shared = findSharedTags(tags1, tags2);
      return count + shared.length;
    }, 0);
    
    return sharedTags / (cluster.length - 1);
  }, []);

  // Filter and sort suggestions
  const filterAndSortSuggestions = useCallback((suggestions, query, filter, sort) => {
    let filtered = suggestions;
    
    // Apply search filter
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(suggestion => 
        suggestion.title.toLowerCase().includes(searchLower) ||
        suggestion.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(suggestion => suggestion.type === filter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'recent':
          return (b.metadata?.lastAccessed || 0) - (a.metadata?.lastAccessed || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return filtered.slice(0, maxSuggestions);
  }, [maxSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setSelectedSuggestion(suggestion);
    
    switch (suggestion.action) {
      case 'continue':
      case 'continue_thread':
        // Send message to continue research
        chrome.runtime.sendMessage({
          type: 'CONTINUE_RESEARCH',
          data: suggestion.data
        });
        addToast({
          type: 'success',
          title: 'Research Continued',
          message: `Resuming research on "${suggestion.data.topic || suggestion.data.title}"`
        });
        break;
        
      case 'explore':
      case 'explore_concept':
        // Send message to explore topic
        chrome.runtime.sendMessage({
          type: 'EXPLORE_TOPIC',
          data: suggestion.data
        });
        addToast({
          type: 'info',
          title: 'Topic Exploration',
          message: `Exploring "${suggestion.data.concept || suggestion.data.topic}"`
        });
        break;
        
      case 'open_workbook':
      case 'workbook_access':
        // Send message to open workbook
        chrome.runtime.sendMessage({
          type: 'OPEN_WORKBOOK',
          data: suggestion.data
        });
        addToast({
          type: 'success',
          title: 'Workbook Opened',
          message: `Opening "${suggestion.data.title}"`
        });
        break;
    }
  }, [addToast]);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Refresh suggestions
  const refreshSuggestions = useCallback(() => {
    chrome.runtime.sendMessage({
      type: 'REFRESH_SUGGESTIONS'
    });
    
    addToast({
      type: 'info',
      title: 'Suggestions Refreshed',
      message: 'Research suggestions have been updated'
    });
  }, [addToast]);

  // Auto-refresh effect
  useEffect(() => {
    if (!enableAutoRefresh) return;
    
    const interval = setInterval(() => {
      refreshSuggestions();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshSuggestions]);

  return (
    <div className={`research-continuity ${className}`}>
      {/* Header */}
      <div className="continuity-header">
        <div className="continuity-title">
          <BookOpen className="w-5 h-5" />
          <h2>Research Continuity</h2>
        </div>
        
        <div className="continuity-actions">
          <button
            onClick={refreshSuggestions}
            className="refresh-btn"
            title="Refresh suggestions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="continuity-controls">
        <div className="search-container">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search research suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="continue">Continue Research</option>
            <option value="related">Related Topics</option>
            <option value="workbook">Workbooks</option>
            <option value="connection">Connections</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="relevance">Most Relevant</option>
            <option value="recent">Most Recent</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Suggestions Tabs */}
      <div className="continuity-tabs">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
        >
          <Lightbulb className="w-4 h-4" />
          Suggestions
        </button>
        
        <button
          onClick={() => setActiveTab('topics')}
          className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
        >
          <Tag className="w-4 h-4" />
          Topics
        </button>
        
        <button
          onClick={() => setActiveTab('workbooks')}
          className={`tab-btn ${activeTab === 'workbooks' ? 'active' : ''}`}
        >
          <Bookmark className="w-4 h-4" />
          Workbooks
        </button>
      </div>

      {/* Content Area */}
      <div className="continuity-content">
        {activeTab === 'suggestions' && (
          <div className="suggestions-panel">
            {/* Subtle contextual reminder */}
            {suggestions.some(s => s.priority === 'critical') && (
              <div className="contextual-reminder">
                <Lightbulb className="w-4 h-4" />
                <span>Active research detected - continue your exploration</span>
              </div>
            )}
            
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-item ${selectedSuggestion?.id === suggestion.id ? 'selected' : ''} ${suggestion.priority === 'critical' ? 'critical' : ''}`}
                >
                  <div className="suggestion-icon">
                    {suggestion.icon}
                  </div>
                  
                  <div className="suggestion-content">
                    <div className="suggestion-header">
                      <h3 className="suggestion-title">
                        {suggestion.title}
                        {suggestion.priority === 'critical' && (
                          <span className="live-indicator">●</span>
                        )}
                      </h3>
                      
                      {/* Subtle priority indicator */}
                      {suggestion.priority === 'critical' && (
                        <span className="critical-indicator">Active</span>
                      )}
                    </div>
                    
                    <p className="suggestion-description">{suggestion.description}</p>
                    
                    {/* Intelligent metadata display */}
                    {suggestion.metadata && (
                      <div className="suggestion-metadata">
                        {suggestion.metadata.isVeryRecent && (
                          <div className="metadata-item recent">
                            <Clock className="w-3 h-3" />
                            Just now
                          </div>
                        )}
                        
                        {suggestion.metadata.isUrgent && (
                          <div className="metadata-item urgent">
                            <RefreshCw className="w-3 h-3" />
                            Active
                          </div>
                        )}
                        
                        {suggestion.metadata.hasRecentActivity && (
                          <div className="metadata-item recent">
                            <Users className="w-3 h-3" />
                            Recent activity
                          </div>
                        )}
                        
                        {suggestion.metadata.frequency && suggestion.metadata.frequency > 1 && (
                          <div className="metadata-item">
                            <TrendingUp className="w-3 h-3" />
                            {suggestion.metadata.frequency} visits
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="suggestion-action">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
            
            {suggestions.length === 0 && (
              <div className="empty-state subtle">
                <Search className="w-6 h-6" />
                <h3>Research suggestions appear here</h3>
                <p>As you explore, intelligent suggestions will help maintain continuity</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'topics' && (
          <div className="topics-panel">
            <div className="topics-grid">
              {recentTopics?.slice(0, 12).map((topic, index) => (
                <div
                  key={topic.topic}
                  className="topic-card"
                  onClick={() => handleSuggestionClick({
                    id: `topic_${index}`,
                    type: 'explore',
                    priority: 'medium',
                    title: topic.topic,
                    description: `Continue research on ${topic.topic}`,
                    icon: <BookOpen className="w-4 h-4" />,
                    action: 'explore',
                    data: topic
                  })}
                >
                  <div className="topic-header">
                    <h4 className="topic-title">{topic.topic}</h4>
                    <span className="topic-frequency">{topic.frequency} times</span>
                  </div>
                  
                  <div className="topic-metadata">
                    <div className="metadata-item">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(topic.lastAccessed)}
                    </div>
                    <div className="metadata-item">
                      <Tag className="w-3 h-3" />
                      {(topic.semanticTags || []).slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'workbooks' && (
          <div className="workbooks-panel">
            <div className="workbooks-grid">
              {activeWorkbooks?.slice(0, 9).map((workbook, index) => (
                <div
                  key={workbook.id}
                  className="workbook-card"
                  onClick={() => handleSuggestionClick({
                    id: `workbook_${index}`,
                    type: 'open_workbook',
                    priority: 'medium',
                    title: workbook.title,
                    description: `${workbook.accessCount} recent accesses`,
                    icon: <Bookmark className="w-4 h-4" />,
                    action: 'open_workbook',
                    data: workbook
                  })}
                >
                  <div className="workbook-header">
                    <h4 className="workbook-title">{workbook.title}</h4>
                    <span className="workbook-type">{workbook.type}</span>
                  </div>
                  
                  <div className="workbook-metadata">
                    <div className="metadata-item">
                      <Users className="w-3 h-3" />
                      {workbook.accessCount} accesses
                    </div>
                    <div className="metadata-item">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(workbook.lastAccessed)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Suggestion Detail */}
      {selectedSuggestion && (
        <div className="suggestion-detail">
          <div className="detail-header">
            <button
              onClick={() => setSelectedSuggestion(null)}
              className="close-detail-btn"
            >
              ×
            </button>
            
            <div className="detail-title">
              {selectedSuggestion.icon}
              <h3>{selectedSuggestion.title}</h3>
            </div>
          </div>
          
          <div className="detail-content">
            <p className="detail-description">{selectedSuggestion.description}</p>
            
            {selectedSuggestion.metadata && (
              <div className="detail-metadata">
                {Object.entries(selectedSuggestion.metadata).map(([key, value]) => (
                  <div key={key} className="detail-metadata-item">
                    <span className="metadata-label">{formatMetadataLabel(key)}:</span>
                    <span className="metadata-value">{formatMetadataValue(key, value)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="detail-actions">
              <button
                onClick={() => handleSuggestionClick(selectedSuggestion)}
                className="primary-action-btn"
              >
                {getActionLabel(selectedSuggestion.action)}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for intelligent continuity
const calculateThreadPriority = (thread, currentTime) => {
  let priority = 0.5; // Base priority
  
  // Recent activity boost
  const timeSinceActivity = currentTime - thread.lastActivity;
  if (timeSinceActivity < 5 * 60 * 1000) { // 5 minutes
    priority += 0.3;
  } else if (timeSinceActivity < 30 * 60 * 1000) { // 30 minutes
    priority += 0.2;
  }
  
  // Message activity boost
  const messageCount = thread.messages?.length || 0;
  if (messageCount > 5) {
    priority += 0.1;
  }
  
  // Thread duration boost (longer threads are more important)
  const duration = currentTime - thread.startTime;
  if (duration > 30 * 60 * 1000) { // 30 minutes
    priority += 0.1;
  }
  
  return Math.min(1, priority);
};

const getSessionContext = () => {
  // Get session context from extension state or local storage
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.session.get(['focusflow_session_context']) || {};
    }
  } catch (error) {
    // Fallback to empty context
    return {};
  }
  return {};
};

const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

const formatMetadataLabel = (key) => {
  const labels = {
    lastAccessed: 'Last Accessed',
    frequency: 'Frequency',
    similarity: 'Similarity',
    sharedTags: 'Shared Tags',
    connectionType: 'Connection Type',
    connectionStrength: 'Connection Strength',
    messages: 'Messages',
    duration: 'Duration',
    accessCount: 'Access Count',
    topicCount: 'Topics'
  };
  return labels[key] || key;
};

const formatMetadataValue = (key, value) => {
  switch (key) {
    case 'similarity':
      return `${(value * 100).toFixed(1)}%`;
    case 'connectionType':
      return value.charAt(0).toUpperCase() + value.slice(1);
    case 'duration':
      return `${Math.floor(value / (1000 * 60))}m`;
    case 'sharedTags':
      return Array.isArray(value) ? value.slice(0, 3).join(', ') : value;
    default:
      return value;
  }
};

const getActionLabel = (action) => {
  const labels = {
    continue: 'Continue Research',
    explore: 'Explore Topic',
    open_workbook: 'Open Workbook',
    continue_thread: 'Resume Thread',
    explore_concept: 'Explore Connection'
  };
  return labels[action] || action;
};

export default ResearchContinuity;
