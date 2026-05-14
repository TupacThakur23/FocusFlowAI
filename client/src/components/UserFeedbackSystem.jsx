import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Bug, Lightbulb, ThumbsUp, ThumbsDown, Send, X, Star, CheckCircle, AlertCircle, Info, ChevronRight, ChevronDown, Plus, Minus, Flag, Heart, Meh, Zap, FileText, Settings, HelpCircle, MessageCircle, AlertTriangle, Clock, User, Mail, Phone, Globe, Shield, Target, TrendingUp } from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';
const UserFeedbackSystem = ({
  className = '',
  onFeedbackSubmit,
  onIssueReport,
  trigger = 'manual',
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    email: '',
    attachments: [],
    userAgent: '',
    url: '',
    reproductionSteps: '',
    expectedBehavior: '',
    actualBehavior: ''
  });
  const [feedbackHistory] = useExtensionState('feedbackHistory', {
    storage: 'local'
  });
  const [userProfile] = useExtensionState('userProfile', {
    storage: 'local'
  });
  const {
    addToast
  } = useGlobalStatus();
  const feedbackCategories = {
    general: {
      icon: <MessageSquare className="w-4 h-4" />,
      label: 'General Feedback',
      description: 'Share your thoughts and suggestions',
      subcategories: ['praise', 'suggestion', 'question', 'other']
    },
    bug: {
      icon: <Bug className="w-4 h-4" />,
      label: 'Bug Report',
      description: 'Report technical issues or problems',
      subcategories: ['crash', 'performance', 'ui_issue', 'functionality', 'other']
    },
    feature: {
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Feature Request',
      description: 'Suggest new features or improvements',
      subcategories: ['new_feature', 'enhancement', 'integration', 'other']
    },
    workflow: {
      icon: <Target className="w-4 h-4" />,
      label: 'Workflow Feedback',
      description: 'Share your research workflow experience',
      subcategories: ['research_flow', 'note_taking', 'search', 'synthesis', 'other']
    }
  };
  const severityLevels = {
    low: {
      label: 'Low',
      color: 'green',
      description: 'Minor issue or suggestion'
    },
    medium: {
      label: 'Medium',
      color: 'yellow',
      description: 'Moderate impact on usability'
    },
    high: {
      label: 'High',
      color: 'orange',
      description: 'Significant impact on functionality'
    },
    critical: {
      label: 'Critical',
      color: 'red',
      description: 'Blocks core functionality'
    }
  };
  const satisfactionPrompts = [{
    id: 'onboarding',
    trigger: 'session_start',
    delay: 30000,
    question: 'How was your onboarding experience?'
  }, {
    id: 'first_use',
    trigger: 'first_feature_use',
    delay: 60000,
    question: 'How helpful was this feature?'
  }, {
    id: 'research_session',
    trigger: 'session_end',
    delay: 0,
    question: 'How was your research session?'
  }, {
    id: 'weekly',
    trigger: 'weekly',
    delay: 0,
    question: 'How satisfied are you with FocusFlow AI?'
  }];
  useEffect(() => {
    if (trigger === 'auto') {
      setupSatisfactionPrompts();
    }
  }, [trigger]);
  const handleSubmit = useCallback(async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const feedbackData = {
        ...formData,
        type: feedbackType,
        rating,
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        extensionVersion: getExtensionVersion(),
        userProfile: userProfile || {}
      };
      const result = await submitFeedback(feedbackData);
      if (result.success) {
        setShowSuccess(true);
        onFeedbackSubmit?.(feedbackData);
        setFormData({
          title: '',
          description: '',
          category: '',
          severity: 'medium',
          email: '',
          attachments: [],
          userAgent: '',
          url: '',
          reproductionSteps: '',
          expectedBehavior: '',
          actualBehavior: ''
        });
        setRating(0);
        setTimeout(() => {
          setShowSuccess(false);
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Feedback Failed',
        message: 'Unable to submit feedback. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, feedbackType, rating, userProfile, onFeedbackSubmit, addToast]);
  const handleRatingChange = useCallback(newRating => {
    setRating(newRating);
    if (newRating > 0 && newRating <= 3) {
      setFeedbackType('general');
      setActiveTab('feedback');
      setIsOpen(true);
    }
  }, []);
  const handleCategoryToggle = useCallback(category => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);
  const handleQuickFeedback = useCallback((type, value) => {
    const quickFeedback = {
      type: 'quick_feedback',
      feedbackType: type,
      value,
      timestamp: Date.now(),
      sessionId: getSessionId()
    };
    submitFeedback(quickFeedback);
  }, []);
  const renderFeedbackButton = () => {
    if (trigger === 'auto') return null;
    return <button onClick={() => setIsOpen(true)} className={`feedback-button ${position}`} title="Share Feedback">
        <MessageSquare className="w-5 h-5" />
        <span>Feedback</span>
      </button>;
  };
  const renderSatisfactionPrompt = prompt => <div className="satisfaction-prompt">
      <div className="prompt-content">
        <div className="prompt-icon">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="prompt-text">
          <h4>{prompt.question}</h4>
        </div>
        <div className="prompt-actions">
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => handleRatingChange(star)} className={`rating-btn ${star <= rating ? 'active' : ''}`}>
                <Star className="w-5 h-5" />
              </button>)}
          </div>
          <button onClick={() => {
          const promptElement = document.querySelector('.satisfaction-prompt');
          if (promptElement) {
            promptElement.remove();
          }
        }} className="dismiss-btn">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>;
  const renderFeedbackModal = () => {
    if (!isOpen) return null;
    return <div className="feedback-modal-overlay">
        <div className="feedback-modal">
          <div className="modal-header">
            <h3>Share Your Feedback</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          {showSuccess ? <div className="success-message">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h4>Thank You!</h4>
              <p>Your feedback has been submitted successfully.</p>
            </div> : <>
              <div className="modal-tabs">
                {Object.entries(feedbackCategories).map(([key, category]) => <button key={key} onClick={() => setFeedbackType(key)} className={`tab-btn ${feedbackType === key ? 'active' : ''}`}>
                    {category.icon}
                    <span>{category.label}</span>
                  </button>)}
              </div>

              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-section">
                  <label className="form-label">
                    Category
                    <select value={formData.category} onChange={e => setFormData(prev => ({
                  ...prev,
                  category: e.target.value
                }))} className="form-select" required>
                      <option value="">Select a category</option>
                      {feedbackCategories[feedbackType].subcategories.map(sub => <option key={sub} value={sub}>
                          {sub.replace('_', ' ').charAt(0).toUpperCase() + sub.replace('_', ' ').slice(1)}
                        </option>)}
                    </select>
                  </label>
                </div>

                {feedbackType === 'bug' && <div className="form-section">
                    <label className="form-label">
                      Severity
                      <div className="severity-options">
                        {Object.entries(severityLevels).map(([key, level]) => <label key={key} className="severity-option">
                            <input type="radio" name="severity" value={key} checked={formData.severity === key} onChange={e => setFormData(prev => ({
                      ...prev,
                      severity: e.target.value
                    }))} />
                            <span className={`severity-indicator ${level.color}`}>
                              {level.label}
                            </span>
                          </label>)}
                      </div>
                    </label>
                  </div>}

                <div className="form-section">
                  <label className="form-label">
                    Title
                    <input type="text" value={formData.title} onChange={e => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))} className="form-input" placeholder="Brief description of your feedback" required />
                  </label>
                </div>

                <div className="form-section">
                  <label className="form-label">
                    Description
                    <textarea value={formData.description} onChange={e => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))} className="form-textarea" placeholder="Provide detailed information about your feedback" rows={4} required />
                  </label>
                </div>

                {feedbackType === 'bug' && <>
                    <div className="form-section">
                      <label className="form-label">
                        Steps to Reproduce
                        <textarea value={formData.reproductionSteps} onChange={e => setFormData(prev => ({
                    ...prev,
                    reproductionSteps: e.target.value
                  }))} className="form-textarea" placeholder="Describe the steps to reproduce the issue" rows={3} />
                      </label>
                    </div>

                    <div className="form-section">
                      <label className="form-label">
                        Expected Behavior
                        <textarea value={formData.expectedBehavior} onChange={e => setFormData(prev => ({
                    ...prev,
                    expectedBehavior: e.target.value
                  }))} className="form-textarea" placeholder="What did you expect to happen?" rows={2} />
                      </label>
                    </div>

                    <div className="form-section">
                      <label className="form-label">
                        Actual Behavior
                        <textarea value={formData.actualBehavior} onChange={e => setFormData(prev => ({
                    ...prev,
                    actualBehavior: e.target.value
                  }))} className="form-textarea" placeholder="What actually happened?" rows={2} />
                      </label>
                    </div>
                  </>}

                <div className="form-section">
                  <label className="form-label">
                    Email (optional)
                    <input type="email" value={formData.email} onChange={e => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))} className="form-input" placeholder="your.email@example.com" />
                    <small>We'll only use this to follow up on your feedback</small>
                  </label>
                </div>

                <div className="form-section">
                  <label className="form-label">
                    Rating
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)} className={`rating-btn ${star <= rating ? 'active' : ''}`}>
                          <Star className="w-6 h-6" />
                        </button>)}
                    </div>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? <>
                        <div className="spinner" />
                        Submitting...
                      </> : <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>}
                  </button>

                  <button type="button" onClick={() => setIsOpen(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </>}
        </div>
      </div>;
  };
  const renderQuickFeedback = () => <div className="quick-feedback">
      <div className="quick-feedback-header">
        <h4>Quick Feedback</h4>
        <p>Share your thoughts instantly</p>
      </div>

      <div className="quick-feedback-options">
        <button onClick={() => handleQuickFeedback('helpful', true)} className="quick-btn positive">
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful</span>
        </button>

        <button onClick={() => handleQuickFeedback('helpful', false)} className="quick-btn negative">
          <ThumbsDown className="w-4 h-4" />
          <span>Not Helpful</span>
        </button>

        <button onClick={() => handleQuickFeedback('confused', true)} className="quick-btn neutral">
          <Meh className="w-4 h-4" />
          <span>Confusing</span>
        </button>

        <button onClick={() => handleQuickFeedback('love', true)} className="quick-btn positive">
          <Heart className="w-4 h-4" />
          <span>Love It</span>
        </button>
      </div>
    </div>;
  const renderFeedbackHistory = () => {
    if (!feedbackHistory || feedbackHistory.length === 0) return null;
    return <div className="feedback-history">
        <div className="history-header">
          <h4>Your Recent Feedback</h4>
          <button onClick={() => setExpandedCategories(prev => {
          const newSet = new Set(prev);
          if (newSet.has('history')) {
            newSet.delete('history');
          } else {
            newSet.add('history');
          }
          return newSet;
        })} className="toggle-btn">
            {expandedCategories.has('history') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {expandedCategories.has('history') && <div className="history-list">
            {feedbackHistory.slice(-5).map((feedback, index) => <div key={index} className="history-item">
                <div className="history-icon">
                  {feedback.type === 'bug' && <Bug className="w-4 h-4" />}
                  {feedback.type === 'feature' && <Lightbulb className="w-4 h-4" />}
                  {feedback.type === 'general' && <MessageSquare className="w-4 h-4" />}
                  {feedback.type === 'workflow' && <Target className="w-4 h-4" />}
                </div>
                <div className="history-content">
                  <h5>{feedback.title}</h5>
                  <p>{feedback.description}</p>
                  <div className="history-meta">
                    <span className="date">
                      <Clock className="w-3 h-3" />
                      {new Date(feedback.timestamp).toLocaleDateString()}
                    </span>
                    {feedback.rating && <span className="rating">
                        <Star className="w-3 h-3" />
                        {feedback.rating}/5
                      </span>}
                  </div>
                </div>
              </div>)}
          </div>}
      </div>;
  };
  const getSessionId = () => {
    return 'session_' + Date.now();
  };
  const getExtensionVersion = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return chrome.runtime.getManifest().version;
    }
    return '1.0.0';
  };
  const submitFeedback = async feedbackData => {
    try {
      const updatedHistory = [...(feedbackHistory || []), feedbackData];
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({
          feedbackHistory: updatedHistory
        });
      }
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });
      if (response.ok) {
        return {
          success: true
        };
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  const setupSatisfactionPrompts = () => {};
  return <div className={`user-feedback-system ${className}`}>
      {renderFeedbackButton()}
      {renderFeedbackModal()}
      {renderQuickFeedback()}
      {renderFeedbackHistory()}

      {trigger === 'auto' && satisfactionPrompts.map(prompt => <div key={prompt.id} className="auto-prompt">
          {renderSatisfactionPrompt(prompt)}
        </div>)}
    </div>;
};
export default UserFeedbackSystem;
