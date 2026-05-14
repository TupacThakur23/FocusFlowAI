import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Eye, EyeOff, Download, Trash2, Settings, Database, Cloud, HardDrive, CheckCircle, AlertCircle, Info, ChevronRight, ChevronDown, X, RefreshCw, FileText, Cookie, Globe, Smartphone, Monitor, Activity, Zap, Brain, BookOpen, Target, Clock, User, Mail, Phone } from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';
const PrivacyCenter = ({
  className = '',
  onSettingsChange,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [privacySettings, setPrivacySettings] = useExtensionState('privacySettings', {
    storage: 'sync'
  });
  const [dataUsage, setDataUsage] = useExtensionState('dataUsage', {
    storage: 'local'
  });
  const [consentStatus, setConsentStatus] = useExtensionState('consentStatus', {
    storage: 'local'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {
    addToast
  } = useGlobalStatus();
  const privacyTabs = [{
    id: 'overview',
    label: 'Overview',
    icon: <Shield className="w-4 h-4" />
  }, {
    id: 'data',
    label: 'Data Usage',
    icon: <Database className="w-4 h-4" />
  }, {
    id: 'controls',
    label: 'Privacy Controls',
    icon: <Settings className="w-4 h-4" />
  }, {
    id: 'transparency',
    label: 'AI Transparency',
    icon: <Brain className="w-4 h-4" />
  }, {
    id: 'export',
    label: 'Data Management',
    icon: <Download className="w-4 h-4" />
  }];
  useEffect(() => {
    if (!privacySettings) {
      setPrivacySettings({
        dataCollection: true,
        localProcessing: true,
        analytics: false,
        crashReporting: true,
        personalization: true,
        researchContinuity: true,
        semanticSearch: true,
        aiAssistance: true,
        dataRetention: 30,
        encryptionEnabled: true,
        secureStorage: true
      });
    }
  }, [privacySettings, setPrivacySettings]);
  const handleSettingChange = useCallback((setting, value) => {
    const newSettings = {
      ...privacySettings,
      [setting]: value
    };
    setPrivacySettings(newSettings);
    onSettingsChange?.(newSettings);
    addToast({
      type: 'success',
      title: 'Privacy Setting Updated',
      message: `${setting} has been updated`,
      duration: 2000
    });
  }, [privacySettings, setPrivacySettings, onSettingsChange, addToast]);
  const handleConsentUpdate = useCallback((consentType, granted) => {
    const newConsent = {
      ...consentStatus,
      [consentType]: {
        granted,
        timestamp: Date.now()
      }
    };
    setConsentStatus(newConsent);
    addToast({
      type: 'info',
      title: 'Consent Updated',
      message: `Your consent preferences have been saved`,
      duration: 2000
    });
  }, [consentStatus, setConsentStatus, addToast]);
  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const userData = await this.collectUserData();
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focusflow-ai-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully',
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export your data. Please try again.',
        duration: 5000
      });
    } finally {
      setIsExporting(false);
    }
  }, [addToast]);
  const handleDeleteData = useCallback(async () => {
    setIsDeleting(true);
    try {
      await this.deleteAllUserData();
      setPrivacySettings({
        dataCollection: false,
        localProcessing: true,
        analytics: false,
        crashReporting: false,
        personalization: false,
        researchContinuity: false,
        semanticSearch: false,
        aiAssistance: false,
        dataRetention: 0,
        encryptionEnabled: true,
        secureStorage: true
      });
      addToast({
        type: 'success',
        title: 'Data Deleted',
        message: 'All your data has been permanently deleted',
        duration: 3000
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete your data. Please try again.',
        duration: 5000
      });
    } finally {
      setIsDeleting(false);
    }
  }, [setPrivacySettings, addToast]);
  const toggleSection = useCallback(sectionId => {
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
  const renderOverview = () => <div className="privacy-overview">
      <div className="overview-header">
        <Shield className="w-8 h-8 text-blue-500" />
        <div>
          <h2>Privacy & Security Overview</h2>
          <p>Your privacy is our priority. FocusFlow AI processes data locally and respects your choices.</p>
        </div>
      </div>

      <div className="privacy-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">Local</div>
            <div className="metric-label">Processing</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Lock className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">Encrypted</div>
            <div className="metric-label">Storage</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <EyeOff className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">Private</div>
            <div className="metric-label">By Default</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">No Tracking</div>
            <div className="metric-label">Third Parties</div>
          </div>
        </div>
      </div>

      <div className="privacy-highlights">
        <div className="highlight-item">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4>Local Processing</h4>
            <p>All AI processing happens locally on your device. Your data never leaves your browser.</p>
          </div>
        </div>

        <div className="highlight-item">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4>No Data Collection</h4>
            <p>We don't collect personal data or track your browsing habits.</p>
          </div>
        </div>

        <div className="highlight-item">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4>Open Source</h4>
            <p>Our code is transparent and available for review.</p>
          </div>
        </div>

        <div className="highlight-item">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h4>GDPR Compliant</h4>
            <p>We follow privacy regulations and give you full control over your data.</p>
          </div>
        </div>
      </div>
    </div>;
  const renderDataUsage = () => <div className="data-usage">
      <div className="usage-header">
        <Database className="w-8 h-8 text-blue-500" />
        <div>
          <h2>Data Usage & Storage</h2>
          <p>Understand how FocusFlow AI uses and stores your data.</p>
        </div>
      </div>

      <div className="data-categories">
        <div className="category-item">
          <div className="category-header" onClick={() => toggleSection('research-data')}>
            <div className="category-info">
              <BookOpen className="w-5 h-5" />
              <div>
                <h4>Research Data</h4>
                <p>Your notes, highlights, and research materials</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 ${expandedSections.has('research-data') ? 'expanded' : ''}`} />
          </div>

          {expandedSections.has('research-data') && <div className="category-details">
              <div className="detail-item">
                <span className="detail-label">Storage Location:</span>
                <span className="detail-value">Local browser storage</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data Type:</span>
                <span className="detail-value">Text, metadata, embeddings</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Retention:</span>
                <span className="detail-value">{privacySettings?.dataRetention || 30} days</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Encryption:</span>
                <span className="detail-value">AES-256</span>
              </div>
            </div>}
        </div>

        <div className="category-item">
          <div className="category-header" onClick={() => toggleSection('ai-data')}>
            <div className="category-info">
              <Brain className="w-5 h-5" />
              <div>
                <h4>AI Processing Data</h4>
                <p>Temporary data used for AI assistance</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 ${expandedSections.has('ai-data') ? 'expanded' : ''}`} />
          </div>

          {expandedSections.has('ai-data') && <div className="category-details">
              <div className="detail-item">
                <span className="detail-label">Processing Location:</span>
                <span className="detail-value">Local device</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data Type:</span>
                <span className="detail-value">Text embeddings, context</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Storage:</span>
                <span className="detail-value">Temporary, cleared on exit</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sharing:</span>
                <span className="detail-value">Never shared</span>
              </div>
            </div>}
        </div>

        <div className="category-item">
          <div className="category-header" onClick={() => toggleSection('session-data')}>
            <div className="category-info">
              <Clock className="w-5 h-5" />
              <div>
                <h4>Session Data</h4>
                <p>Temporary session information and preferences</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 ${expandedSections.has('session-data') ? 'expanded' : ''}`} />
          </div>

          {expandedSections.has('session-data') && <div className="category-details">
              <div className="detail-item">
                <span className="detail-label">Storage Location:</span>
                <span className="detail-value">Session storage</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data Type:</span>
                <span className="detail-value">Preferences, UI state</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Retention:</span>
                <span className="detail-value">Session duration</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Persistence:</span>
                <span className="detail-value">Not persistent</span>
              </div>
            </div>}
        </div>
      </div>

      <div className="storage-usage">
        <h3>Storage Usage</h3>
        <div className="usage-bar">
          <div className="usage-fill" style={{
          width: '25%'
        }} />
        </div>
        <div className="usage-details">
          <span>2.5 MB used of 10 MB</span>
          <button onClick={() => this.clearCache()} className="clear-cache-btn">
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
        </div>
      </div>
    </div>;
  const renderPrivacyControls = () => <div className="privacy-controls">
      <div className="controls-header">
        <Settings className="w-8 h-8 text-blue-500" />
        <div>
          <h2>Privacy Controls</h2>
          <p>Customize your privacy preferences and data usage.</p>
        </div>
      </div>

      <div className="control-sections">
        <div className="control-section">
          <h3>Data Collection</h3>
          <div className="control-items">
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Database className="w-4 h-4" />
                  <span>Data Collection</span>
                </div>
                <p className="control-description">Allow collection of research data for local processing</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.dataCollection || false} onChange={e => handleSettingChange('dataCollection', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <HardDrive className="w-4 h-4" />
                  <span>Local Processing Only</span>
                </div>
                <p className="control-description">Process all data locally without cloud services</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.localProcessing || false} onChange={e => handleSettingChange('localProcessing', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Activity className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                <p className="control-description">Share anonymous usage analytics to improve the product</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.analytics || false} onChange={e => handleSettingChange('analytics', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>AI Features</h3>
          <div className="control-items">
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Brain className="w-4 h-4" />
                  <span>AI Assistance</span>
                </div>
                <p className="control-description">Enable AI-powered research assistance</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.aiAssistance || false} onChange={e => handleSettingChange('aiAssistance', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Target className="w-4 h-4" />
                  <span>Research Continuity</span>
                </div>
                <p className="control-description">Maintain research context across sessions</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.researchContinuity || false} onChange={e => handleSettingChange('researchContinuity', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Zap className="w-4 h-4" />
                  <span>Semantic Search</span>
                </div>
                <p className="control-description">Enable semantic search across your research</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.semanticSearch || false} onChange={e => handleSettingChange('semanticSearch', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Data Retention</h3>
          <div className="control-items">
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Clock className="w-4 h-4" />
                  <span>Data Retention Period</span>
                </div>
                <p className="control-description">How long to keep your research data</p>
              </div>
              <select value={privacySettings?.dataRetention || 30} onChange={e => handleSettingChange('dataRetention', parseInt(e.target.value))} className="retention-select">
                <option value={0}>Delete immediately</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={-1}>Forever</option>
              </select>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Security</h3>
          <div className="control-items">
            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Lock className="w-4 h-4" />
                  <span>Encryption</span>
                </div>
                <p className="control-description">Encrypt all stored data</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.encryptionEnabled || false} onChange={e => handleSettingChange('encryptionEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-info">
                <div className="control-label">
                  <Shield className="w-4 h-4" />
                  <span>Secure Storage</span>
                </div>
                <p className="control-description">Use secure browser storage APIs</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={privacySettings?.secureStorage || false} onChange={e => handleSettingChange('secureStorage', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderAITransparency = () => <div className="ai-transparency">
      <div className="transparency-header">
        <Brain className="w-8 h-8 text-blue-500" />
        <div>
          <h2>AI Transparency</h2>
          <p>Understand how AI processes your data and makes decisions.</p>
        </div>
      </div>

      <div className="ai-info-sections">
        <div className="info-section">
          <h3>How AI Works</h3>
          <div className="info-content">
            <div className="info-item">
              <div className="info-icon">
                <Eye className="w-5 h-5" />
              </div>
              <div className="info-details">
                <h4>Local Processing</h4>
                <p>All AI processing happens locally in your browser. Your data never leaves your device.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Database className="w-5 h-5" />
              </div>
              <div className="info-details">
                <h4>Context Understanding</h4>
                <p>The AI analyzes the current page content and your research context to provide relevant assistance.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Zap className="w-5 h-5" />
              </div>
              <div className="info-details">
                <h4>Semantic Analysis</h4>
                <p>Advanced language models understand meaning and relationships in your research content.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Data Processing</h3>
          <div className="info-content">
            <div className="processing-flow">
              <div className="flow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Content Analysis</h4>
                  <p>Current page content is analyzed for key concepts and context</p>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Context Building</h4>
                  <p>Your research history and preferences are considered</p>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>AI Processing</h4>
                  <p>Local AI model processes the information</p>
                </div>
              </div>

              <div className="flow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Response Generation</h4>
                  <p>Contextual assistance is provided</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Model Information</h3>
          <div className="info-content">
            <div className="model-details">
              <div className="model-item">
                <span className="model-label">Model Type:</span>
                <span className="model-value">Local Language Model</span>
              </div>
              <div className="model-item">
                <span className="model-label">Processing Location:</span>
                <span className="model-value">Your Device</span>
              </div>
              <div className="model-item">
                <span className="model-label">Data Sharing:</span>
                <span className="model-value">None</span>
              </div>
              <div className="model-item">
                <span className="model-label">Update Frequency:</span>
                <span className="model-value">With Extension Updates</span>
              </div>
              <div className="model-item">
                <span className="model-label">Privacy:</span>
                <span className="model-value">100% Private</span>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Consent Status</h3>
          <div className="info-content">
            <div className="consent-items">
              <div className="consent-item">
                <div className="consent-info">
                  <div className="consent-label">
                    <Brain className="w-4 h-4" />
                    <span>AI Processing</span>
                  </div>
                  <p className="consent-description">Local AI processing for research assistance</p>
                </div>
                <div className="consent-status">
                  {consentStatus?.aiProcessing?.granted ? <span className="status-granted">
                      <CheckCircle className="w-4 h-4" />
                      Granted
                    </span> : <button onClick={() => handleConsentUpdate('aiProcessing', true)} className="consent-btn">
                      Grant Consent
                    </button>}
                </div>
              </div>

              <div className="consent-item">
                <div className="consent-info">
                  <div className="consent-label">
                    <Database className="w-4 h-4" />
                    <span>Data Storage</span>
                  </div>
                  <p className="consent-description">Local storage of research data</p>
                </div>
                <div className="consent-status">
                  {consentStatus?.dataStorage?.granted ? <span className="status-granted">
                      <CheckCircle className="w-4 h-4" />
                      Granted
                    </span> : <button onClick={() => handleConsentUpdate('dataStorage', true)} className="consent-btn">
                      Grant Consent
                    </button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderDataManagement = () => <div className="data-management">
      <div className="management-header">
        <Download className="w-8 h-8 text-blue-500" />
        <div>
          <h2>Data Management</h2>
          <p>Export, delete, and manage your data.</p>
        </div>
      </div>

      <div className="management-actions">
        <div className="action-section">
          <h3>Export Your Data</h3>
          <div className="action-description">
            <p>Download a copy of all your research data, notes, and settings.</p>
          </div>
          <button onClick={handleExportData} disabled={isExporting} className="action-btn primary">
            {isExporting ? <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Exporting...
              </> : <>
                <Download className="w-4 h-4" />
                Export Data
              </>}
          </button>
        </div>

        <div className="action-section">
          <h3>Delete Your Data</h3>
          <div className="action-description">
            <p>Permanently delete all your data from this device. This action cannot be undone.</p>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)} className="action-btn danger">
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </button>
        </div>

        <div className="action-section">
          <h3>Clear Cache</h3>
          <div className="action-description">
            <p>Clear temporary files and cached data to free up storage space.</p>
          </div>
          <button onClick={() => this.clearCache()} className="action-btn secondary">
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
        </div>
      </div>

      {showDeleteConfirm && <div className="delete-confirm-modal">
          <div className="modal-content">
            <div className="modal-header">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3>Delete All Data?</h3>
            </div>

            <div className="modal-body">
              <p>This will permanently delete:</p>
              <ul>
                <li>All research notes and highlights</li>
                <li>AI assistance history</li>
                <li>Personal settings and preferences</li>
                <li>Local storage data</li>
              </ul>
              <p className="warning">This action cannot be undone.</p>
            </div>

            <div className="modal-actions">
              <button onClick={handleDeleteData} disabled={isDeleting} className="btn-danger">
                {isDeleting ? <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </> : <>
                    <Trash2 className="w-4 h-4" />
                    Delete Everything
                  </>}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>}
    </div>;
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'data':
        return renderDataUsage();
      case 'controls':
        return renderPrivacyControls();
      case 'transparency':
        return renderAITransparency();
      case 'export':
        return renderDataManagement();
      default:
        return renderOverview();
    }
  };
  return <div className={`privacy-center ${className}`}>
      <div className="privacy-container">

        <div className="privacy-header">
          <div className="header-content">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1>Privacy Center</h1>
              <p>Manage your privacy and data preferences</p>
            </div>
          </div>

          <button className="close-btn" onClick={() => window.close()}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="privacy-nav">
          {privacyTabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>)}
        </div>

        <div className="privacy-content">
          {renderTabContent()}
        </div>
      </div>
    </div>;
};
export default PrivacyCenter;
