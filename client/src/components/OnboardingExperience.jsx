/**
 * OnboardingExperience - First-Time User Experience for FocusFlow AI
 * 
 * Provides elegant onboarding flow:
 * - First-launch onboarding flow
 * - Guided feature walkthrough
 * - Permission explanations
 * - Contextual tips
 * - Interactive demos
 * - Quick-start templates
 * - Extension setup guidance
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Play, 
  Pause, 
  ArrowRight,
  BookOpen,
  Brain,
  Shield,
  Zap,
  Target,
  Lightbulb,
  Settings,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRightCircle
} from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';

const OnboardingExperience = ({ 
  onComplete, 
  onSkip, 
  className = '',
  forceShow = false 
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [interactiveDemo, setInteractiveDemo] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Extension integration
  const [onboardingState, setOnboardingState] = useExtensionState('onboarding', { storage: 'local' });
  const [permissions] = useExtensionState('permissions', { storage: 'local' });
  const { addToast } = useGlobalStatus();

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to FocusFlow AI',
      subtitle: 'Your intelligent research workspace',
      icon: <Sparkles className="w-8 h-8" />,
      content: 'Transform your browsing into a connected research experience with AI-powered contextual assistance.',
      type: 'welcome',
      actions: ['Get Started', 'Skip Tour']
    },
    {
      id: 'core_value',
      title: 'Contextual Intelligence',
      subtitle: 'AI that understands your research',
      icon: <Brain className="w-8 h-8" />,
      content: 'FocusFlow AI provides contextual assistance based on your current research, not generic responses.',
      type: 'value_prop',
      features: [
        'Semantic understanding of your research context',
        'Continuity across browsing sessions',
        'Intelligent suggestions without distraction'
      ]
    },
    {
      id: 'permissions',
      title: 'Privacy & Permissions',
      subtitle: 'Your data stays private',
      icon: <Shield className="w-8 h-8" />,
      content: 'We only access what we need to provide intelligent assistance, with full transparency.',
      type: 'permissions',
      permissions: [
        { name: 'Read page content', reason: 'To understand your research context', required: true },
        { name: 'Access browsing history', reason: 'To provide research continuity', required: false },
        { name: 'Store data locally', reason: 'To remember your research progress', required: true }
      ]
    },
    {
      id: 'key_features',
      title: 'Key Features',
      subtitle: 'Your research superpowers',
      icon: <Zap className="w-8 h-8" />,
      content: 'Discover the tools that will transform your research workflow.',
      type: 'features',
      features: [
        { icon: <BookOpen className="w-5 h-5" />, title: 'Semantic Notebooks', description: 'AI-enhanced note-taking with contextual understanding' },
        { icon: <Target className="w-5 h-5" />, title: 'Smart Retrieval', description: 'Find relevant information across your research' },
        { icon: <Lightbulb className="w-5 h-5" />, title: 'Intelligent Suggestions', description: 'Contextual recommendations without distraction' }
      ]
    },
    {
      id: 'interactive_demo',
      title: 'Try It Now',
      subtitle: 'Experience the magic',
      icon: <Play className="w-8 h-8" />,
      content: 'See how FocusFlow AI enhances your research with a quick demo.',
      type: 'demo',
      demo: {
        title: 'Research Assistant Demo',
        description: 'Ask a question about the current page and see contextual AI assistance in action.',
        placeholder: 'Try: "What are the key concepts on this page?"'
      }
    },
    {
      id: 'templates',
      title: 'Quick Start Templates',
      subtitle: 'Jump into your research',
      icon: <BookOpen className="w-8 h-8" />,
      content: 'Choose a template to get started quickly with your research workflow.',
      type: 'templates',
      templates: [
        { id: 'academic', title: 'Academic Research', description: 'For students and researchers', icon: '🎓' },
        { id: 'professional', title: 'Professional Research', description: 'For work-related research', icon: '💼' },
        { id: 'personal', title: 'Personal Learning', description: 'For self-directed learning', icon: '🌱' },
        { id: 'custom', title: 'Custom Setup', description: 'Create your own workflow', icon: '⚡' }
      ]
    },
    {
      id: 'setup_complete',
      title: 'Ready to Begin',
      subtitle: 'Your research workspace is ready',
      icon: <Check className="w-8 h-8" />,
      content: 'FocusFlow AI is now set up and ready to enhance your research experience.',
      type: 'completion',
      next_steps: [
        'Start researching on any webpage',
        'Use the sidebar to access your notebooks',
        'Check settings to customize your experience'
      ]
    }
  ];

  // Check if onboarding should be shown
  useEffect(() => {
    if (!forceShow && onboardingState?.completed) {
      setIsCompleted(true);
      return;
    }
    
    if (forceShow || !onboardingState?.seen) {
      // Show onboarding
      setCurrentStep(0);
    }
  }, [forceShow, onboardingState]);

  // Event handlers
  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    setIsSkipped(true);
    setOnboardingState({ seen: true, skipped: true, timestamp: Date.now() });
    onSkip?.();
  }, [onSkip, setOnboardingState]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    setOnboardingState({ 
      seen: true, 
      completed: true, 
      timestamp: Date.now(),
      template: selectedTemplate,
      permissions: showPermissions 
    });
    onComplete?.(selectedTemplate);
  }, [onComplete, selectedTemplate, showPermissions, setOnboardingState]);

  const handlePermissionToggle = useCallback((permissionName, granted) => {
    // Handle permission toggle
    console.log('Permission toggle:', permissionName, granted);
  }, []);

  const handleTemplateSelect = useCallback((templateId) => {
    setSelectedTemplate(templateId);
  }, []);

  const handleDemoStart = useCallback(() => {
    setInteractiveDemo('active');
    // Start interactive demo
    setTimeout(() => {
      setInteractiveDemo('completed');
    }, 3000);
  }, []);

  // Render current step
  const renderStep = () => {
    const step = onboardingSteps[currentStep];
    
    switch (step.type) {
      case 'welcome':
        return renderWelcomeStep(step);
      case 'value_prop':
        return renderValuePropStep(step);
      case 'permissions':
        return renderPermissionsStep(step);
      case 'features':
        return renderFeaturesStep(step);
      case 'demo':
        return renderDemoStep(step);
      case 'templates':
        return renderTemplatesStep(step);
      case 'completion':
        return renderCompletionStep(step);
      default:
        return renderWelcomeStep(step);
    }
  };

  // Render welcome step
  const renderWelcomeStep = (step) => (
    <div className="onboarding-welcome">
      <div className="welcome-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="welcome-content">
        <p className="welcome-description">{step.content}</p>
        
        <div className="welcome-highlights">
          <div className="highlight">
            <Brain className="w-5 h-5" />
            <span>Contextual AI assistance</span>
          </div>
          <div className="highlight">
            <BookOpen className="w-5 h-5" />
            <span>Smart research notebooks</span>
          </div>
          <div className="highlight">
            <Shield className="w-5 h-5" />
            <span>Privacy-first design</span>
          </div>
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary">
          Get Started
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handleSkip} className="btn-secondary">
          Skip Tour
        </button>
      </div>
    </div>
  );

  // Render value proposition step
  const renderValuePropStep = (step) => (
    <div className="onboarding-value-prop">
      <div className="value-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="value-content">
        <p className="value-description">{step.content}</p>
        
        <div className="value-features">
          {step.features.map((feature, index) => (
            <div key={index} className="value-feature">
              <Check className="w-5 h-5 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary">
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Render permissions step
  const renderPermissionsStep = (step) => (
    <div className="onboarding-permissions">
      <div className="permissions-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="permissions-content">
        <p className="permissions-description">{step.content}</p>
        
        <div className="permissions-list">
          {step.permissions.map((permission, index) => (
            <div key={index} className="permission-item">
              <div className="permission-info">
                <div className="permission-name">
                  <Globe className="w-4 h-4" />
                  {permission.name}
                  {permission.required && <span className="required-badge">Required</span>}
                </div>
                <div className="permission-reason">{permission.reason}</div>
              </div>
              
              <div className="permission-toggle">
                <button
                  onClick={() => handlePermissionToggle(permission.name, true)}
                  className={`toggle-btn ${permissions?.[permission.name] ? 'active' : ''}`}
                >
                  {permissions?.[permission.name] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="privacy-note">
          <Lock className="w-4 h-4" />
          <span>Your data is processed locally and never shared with third parties.</span>
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary">
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Render features step
  const renderFeaturesStep = (step) => (
    <div className="onboarding-features">
      <div className="features-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="features-content">
        <p className="features-description">{step.content}</p>
        
        <div className="features-grid">
          {step.features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary">
          Try Demo
          <Play className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Render demo step
  const renderDemoStep = (step) => (
    <div className="onboarding-demo">
      <div className="demo-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="demo-content">
        <p className="demo-description">{step.content}</p>
        
        <div className="demo-interface">
          <div className="demo-header">
            <div className="demo-title">{step.demo.title}</div>
            <div className="demo-status">
              {interactiveDemo === 'active' ? (
                <><div className="status-dot active"></div> Demo Active</>
              ) : interactiveDemo === 'completed' ? (
                <><Check className="w-4 h-4 text-green-500" /> Demo Complete</>
              ) : (
                <><div className="status-dot"></div> Ready to Start</>
              )}
            </div>
          </div>
          
          <div className="demo-body">
            <div className="demo-input">
              <input
                type="text"
                placeholder={step.demo.placeholder}
                className="demo-text-input"
                readOnly={interactiveDemo === 'active'}
              />
              <button 
                onClick={handleDemoStart}
                className={`demo-btn ${interactiveDemo ? 'disabled' : ''}`}
                disabled={interactiveDemo}
              >
                {interactiveDemo === 'active' ? (
                  <><Pause className="w-4 h-4" /> Running...</>
                ) : (
                  <><Play className="w-4 h-4" /> Start Demo</>
                )}
              </button>
            </div>
            
            {interactiveDemo === 'active' && (
              <div className="demo-response">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            {interactiveDemo === 'completed' && (
              <div className="demo-response completed">
                <div className="response-content">
                  <p>This page discusses key concepts in machine learning and artificial intelligence, including neural networks, deep learning, and their applications in various fields.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary" disabled={interactiveDemo !== 'completed'}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Render templates step
  const renderTemplatesStep = (step) => (
    <div className="onboarding-templates">
      <div className="templates-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="templates-content">
        <p className="templates-description">{step.content}</p>
        
        <div className="templates-grid">
          {step.templates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-content">
                <h4 className="template-title">{template.title}</h4>
                <p className="template-description">{template.description}</p>
              </div>
              {selectedTemplate === template.id && (
                <div className="template-selected">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleNext} className="btn-primary">
          Complete Setup
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Render completion step
  const renderCompletionStep = (step) => (
    <div className="onboarding-completion">
      <div className="completion-icon">
        {step.icon}
      </div>
      
      <h2 className="step-title">{step.title}</h2>
      <p className="step-subtitle">{step.subtitle}</p>
      
      <div className="completion-content">
        <p className="completion-description">{step.content}</p>
        
        <div className="next-steps">
          <h4>Next Steps:</h4>
          <ul>
            {step.next_steps.map((nextStep, index) => (
              <li key={index}>
                <ArrowRightCircle className="w-4 h-4" />
                {nextStep}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="completion-summary">
          <div className="summary-item">
            <Settings className="w-4 h-4" />
            <span>Settings configured</span>
          </div>
          <div className="summary-item">
            <Shield className="w-4 h-4" />
            <span>Privacy protected</span>
          </div>
          <div className="summary-item">
            <BookOpen className="w-4 h-4" />
            <span>Workspace ready</span>
          </div>
        </div>
      </div>
      
      <div className="step-actions">
        <button onClick={handleComplete} className="btn-primary">
          Start Researching
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={handlePrevious} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );

  // Don't render if completed or skipped
  if (isCompleted || isSkipped) {
    return null;
  }

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className={`onboarding-experience ${className}`}>
      <div className="onboarding-overlay">
        <div className="onboarding-modal">
          {/* Header */}
          <div className="onboarding-header">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <button 
              onClick={handleSkip}
              className="skip-btn"
              title="Skip onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="step-indicator">
            <span className="step-number">{currentStep + 1}</span>
            <span className="step-total">of {onboardingSteps.length}</span>
          </div>

          {/* Current step content */}
          <div className="onboarding-content">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="onboarding-navigation">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="nav-btn prev"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="step-dots">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`dot ${index === currentStep ? 'active' : ''}`}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="nav-btn next"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingExperience;
