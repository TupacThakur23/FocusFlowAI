

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Zap, 
  Shield, 
  ArrowRight, 
  Play, 
  ChevronDown,
  Globe,
  Layers,
  Lightbulb,
  CheckCircle,
  Star,
  Users,
  Clock,
  Award,
  Sparkles,
  Search,
  FileText,
  Link2,
  Eye,
  Lock,
  Download
} from 'lucide-react';

const LandingPage = ({ className = '' }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInstall = () => {

    if (typeof chrome !== 'undefined' && chrome.webstore) {
      chrome.webstore.install();
    } else {
      window.open('https://chrome.google.com/webstore', '_blank');
    }
  };

  const handlePlayDemo = () => {
    setIsPlaying(true);

  };

  return (
    <div className={`landing-page ${className}`}>
      
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-overlay" />
          <div className="floating-elements">
            <div className="element element-1" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <Brain className="w-12 h-12 text-blue-200" />
            </div>
            <div className="element element-2" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
              <BookOpen className="w-10 h-10 text-purple-200" />
            </div>
            <div className="element element-3" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Research Workspace</span>
            </div>
            
            <h1 className="hero-title">
              Contextual Intelligence
              <span className="title-accent"> for Research</span>
            </h1>
            
            <p className="hero-subtitle">
              Transform your browsing into a connected research experience with AI that understands your context, 
              maintains continuity across sessions, and provides intelligent assistance without distraction.
            </p>
            
            <div className="hero-actions">
              <button onClick={handleInstall} className="btn-primary">
                <Download className="w-5 h-5" />
                Install Extension
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button onClick={handlePlayDemo} className="btn-secondary">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Researchers</div>
              </div>
              <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">User Satisfaction</div>
              </div>
              <div className="stat">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Chrome Store Rating</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="browser-mockup">
              <div className="browser-header">
                <div className="browser-controls">
                  <div className="control control-red" />
                  <div className="control control-yellow" />
                  <div className="control control-green" />
                </div>
                <div className="browser-url">
                  <Globe className="w-4 h-4" />
                  <span>research-article.example.com</span>
                </div>
              </div>
              
              <div className="browser-content">
                <div className="content-page">
                  <div className="ai-assistant">
                    <div className="ai-header">
                      <Brain className="w-5 h-5 text-blue-500" />
                      <span>FocusFlow AI</span>
                    </div>
                    <div className="ai-message">
                      I've analyzed this research paper and identified 3 key concepts 
                      related to your current study on machine learning.
                    </div>
                    <div className="ai-suggestions">
                      <div className="suggestion">
                        <Lightbulb className="w-4 h-4" />
                        <span>Neural Networks in Healthcare</span>
                      </div>
                      <div className="suggestion">
                        <Link2 className="w-4 h-4" />
                        <span>Connect to previous research</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </div>
      </section>

      
      <section className="value-proposition">
        <div className="container">
          <div className="section-header">
            <h2>Not Just Another AI Tool</h2>
            <p>
              FocusFlow AI is a contextual cognitive workspace that understands your research journey,
              maintains semantic continuity, and provides intelligent assistance that feels natural
              and helpful rather than intrusive.
            </p>
          </div>
          
          <div className="value-grid">
            <div className="value-card">
              <div className="value-icon">
                <Brain className="w-8 h-8" />
              </div>
              <h3>Contextual Intelligence</h3>
              <p>
                AI that understands your current research context and provides relevant assistance 
                based on what you're studying, not generic responses.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <Layers className="w-8 h-8" />
              </div>
              <h3>Semantic Continuity</h3>
              <p>
                Your research flows naturally across sessions with intelligent continuity that 
                remembers context and suggests relevant connections.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <Shield className="w-8 h-8" />
              </div>
              <h3>Privacy-First Design</h3>
              <p>
                All processing happens locally on your device. Your research data never leaves 
                your browser, ensuring complete privacy and security.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Research-First Features</h2>
            <p>
              Designed specifically for researchers, students, and knowledge workers who need 
              intelligent assistance that enhances rather than interrupts their workflow.
            </p>
          </div>
          
          <div className="features-showcase">
            <div className="features-visual">
              <div className="feature-demo">
                {activeFeature === 0 && (
                  <div className="demo-content semantic-search">
                    <Search className="w-6 h-6 text-blue-500" />
                    <h4>Semantic Search</h4>
                    <p>Find relevant information across all your research with intelligent understanding of meaning and context.</p>
                  </div>
                )}
                
                {activeFeature === 1 && (
                  <div className="demo-content ai-notes">
                    <FileText className="w-6 h-6 text-purple-500" />
                    <h4>AI-Enhanced Notes</h4>
                    <p>Take smart notes with automatic highlighting, concept extraction, and intelligent summarization.</p>
                  </div>
                )}
                
                {activeFeature === 2 && (
                  <div className="demo-content research-continuity">
                    <Link2 className="w-6 h-6 text-green-500" />
                    <h4>Research Continuity</h4>
                    <p>Maintain context across sessions with intelligent suggestions that connect your research journey.</p>
                  </div>
                )}
                
                {activeFeature === 3 && (
                  <div className="demo-content citation-management">
                    <Eye className="w-6 h-6 text-orange-500" />
                    <h4>Citation Management</h4>
                    <p>Automatically extract and manage citations with transparent source attribution.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="features-list">
              <div 
                className={`feature-item ${activeFeature === 0 ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(0)}
              >
                <div className="feature-icon">
                  <Search className="w-6 h-6" />
                </div>
                <div className="feature-content">
                  <h3>Semantic Search</h3>
                  <p>Find information across your research using natural language and meaning-based search.</p>
                  <ul className="feature-benefits">
                    <li><CheckCircle className="w-4 h-4" /> Understands context and intent</li>
                    <li><CheckCircle className="w-4 h-4" /> Cross-references multiple sources</li>
                    <li><CheckCircle className="w-4 h-4" /> Learns from your research patterns</li>
                  </ul>
                </div>
              </div>
              
              <div 
                className={`feature-item ${activeFeature === 1 ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(1)}
              >
                <div className="feature-icon">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="feature-content">
                  <h3>AI-Enhanced Notes</h3>
                  <p>Intelligent note-taking with automatic organization and insight generation.</p>
                  <ul className="feature-benefits">
                    <li><CheckCircle className="w-4 h-4" /> Auto-extracts key concepts</li>
                    <li><CheckCircle className="w-4 h-4" /> Generates summaries and insights</li>
                    <li><CheckCircle className="w-4 h-4" /> Links related information</li>
                  </ul>
                </div>
              </div>
              
              <div 
                className={`feature-item ${activeFeature === 2 ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(2)}
              >
                <div className="feature-icon">
                  <Link2 className="w-6 h-6" />
                </div>
                <div className="feature-content">
                  <h3>Research Continuity</h3>
                  <p>Maintain context and flow across different research sessions and sources.</p>
                  <ul className="feature-benefits">
                    <li><CheckCircle className="w-4 h-4" /> Remembers research context</li>
                    <li><CheckCircle className="w-4 h-4" /> Suggests relevant connections</li>
                    <li><CheckCircle className="w-4 h-4" /> Builds knowledge graphs</li>
                  </ul>
                </div>
              </div>
              
              <div 
                className={`feature-item ${activeFeature === 3 ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(3)}
              >
                <div className="feature-icon">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="feature-content">
                  <h3>Citation Management</h3>
                  <p>Automatic citation extraction and transparent source attribution.</p>
                  <ul className="feature-benefits">
                    <li><CheckCircle className="w-4 h-4" /> Auto-extracts citations</li>
                    <li><CheckCircle className="w-4 h-4" /> Formats references</li>
                    <li><CheckCircle className="w-4 h-4" /> Tracks source credibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="workflow">
        <div className="container">
          <div className="section-header">
            <h2>Designed for Research Workflows</h2>
            <p>
              From initial exploration to synthesis and publication, FocusFlow AI adapts to your 
              research process and enhances every stage with intelligent assistance.
            </p>
          </div>
          
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Explore</h3>
                <p>Discover relevant information with semantic search and intelligent filtering.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Collect</h3>
                <p>Gather and organize information with AI-enhanced note-taking and automatic highlighting.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Connect</h3>
                <p>Build knowledge networks with intelligent linking and relationship detection.</p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Synthesize</h3>
                <p>Create comprehensive understanding with multi-source synthesis and insight generation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="trust">
        <div className="container">
          <div className="trust-content">
            <div className="trust-text">
              <h2>Trustworthy AI Assistance</h2>
              <p>
                Your privacy and data security are fundamental. FocusFlow AI processes everything 
                locally on your device, ensuring your research remains private and secure.
              </p>
              
              <div className="trust-features">
                <div className="trust-feature">
                  <Lock className="w-6 h-6" />
                  <div>
                    <h4>Local Processing</h4>
                    <p>All AI processing happens on your device</p>
                  </div>
                </div>
                
                <div className="trust-feature">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h4>No Data Collection</h4>
                    <p>We don't collect or store your research data</p>
                  </div>
                </div>
                
                <div className="trust-feature">
                  <Eye className="w-6 h-6" />
                  <div>
                    <h4>Transparent AI</h4>
                    <p>Understand how AI processes your information</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="trust-visual">
              <div className="security-badges">
                <div className="badge">
                  <Shield className="w-8 h-8" />
                  <span>Privacy First</span>
                </div>
                <div className="badge">
                  <Lock className="w-8 h-8" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="badge">
                  <Globe className="w-8 h-8" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Loved by Researchers</h2>
            <p>
              Join thousands of researchers who have transformed their workflow with FocusFlow AI.
            </p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-content">
                <p>
                  "FocusFlow AI has completely changed how I research. The contextual understanding 
                  is incredible - it knows exactly what I'm working on and provides relevant suggestions 
                  without being intrusive."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users className="w-8 h-8" />
                </div>
                <div className="author-info">
                  <h4>Dr. Sarah Chen</h4>
                  <p>Computer Science Researcher</p>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
            
            <div className="testimonial">
              <div className="testimonial-content">
                <p>
                  "The semantic continuity feature is amazing. I can pick up my research days later 
                  and FocusFlow AI remembers exactly where I left off and suggests relevant connections."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users className="w-8 h-8" />
                </div>
                <div className="author-info">
                  <h4>Michael Rodriguez</h4>
                  <p>Graduate Student</p>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
            
            <div className="testimonial">
              <div className="testimonial-content">
                <p>
                  "Finally an AI tool that respects privacy! Everything runs locally and the suggestions 
                  are actually helpful for my research workflow. It's like having a research assistant."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <Users className="w-8 h-8" />
                </div>
                <div className="author-info">
                  <h4>Prof. Emily Watson</h4>
                  <p>Academic Researcher</p>
                </div>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Transform Your Research Today</h2>
              <p>
                Join thousands of researchers who have discovered the power of contextual AI assistance. 
                Install FocusFlow AI and experience research that flows intelligently.
              </p>
              
              <div className="cta-actions">
                <button onClick={handleInstall} className="btn-primary large">
                  <Download className="w-5 h-5" />
                  Install FocusFlow AI
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <div className="cta-benefits">
                  <div className="benefit">
                    <CheckCircle className="w-4 h-4" />
                    <span>Free to use</span>
                  </div>
                  <div className="benefit">
                    <CheckCircle className="w-4 h-4" />
                    <span>No registration required</span>
                  </div>
                  <div className="benefit">
                    <CheckCircle className="w-4 h-4" />
                    <span>Privacy-first design</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="cta-visual">
              <div className="extension-preview">
                <div className="preview-header">
                  <div className="preview-controls">
                    <div className="control control-red" />
                    <div className="control control-yellow" />
                    <div className="control control-green" />
                  </div>
                  <span>FocusFlow AI Extension</span>
                </div>
                <div className="preview-content">
                  <div className="extension-icon">
                    <Brain className="w-12 h-12 text-blue-500" />
                  </div>
                  <div className="extension-info">
                    <h3>FocusFlow AI</h3>
                    <p>Contextual Research Assistant</p>
                    <div className="extension-stats">
                      <div className="stat">
                        <Star className="w-4 h-4" />
                        <span>4.9</span>
                      </div>
                      <div className="stat">
                        <Users className="w-4 h-4" />
                        <span>10K+</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="preview-install-btn">
                  <Download className="w-4 h-4" />
                  Add to Chrome
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <Brain className="w-8 h-8" />
                <span>FocusFlow AI</span>
              </div>
              <p>Contextual research workspace for the modern researcher.</p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#workflow">Workflow</a>
                <a href="#security">Security</a>
                <a href="#pricing">Pricing</a>
              </div>
              
              <div className="link-group">
                <h4>Resources</h4>
                <a href="#docs">Documentation</a>
                <a href="#tutorials">Tutorials</a>
                <a href="#blog">Blog</a>
                <a href="#support">Support</a>
              </div>
              
              <div className="link-group">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
            
            <div className="footer-cta">
              <h4>Get Started</h4>
              <p>Transform your research workflow today.</p>
              <button onClick={handleInstall} className="btn-primary">
                <Download className="w-4 h-4" />
                Install Extension
              </button>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 FocusFlow AI. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
