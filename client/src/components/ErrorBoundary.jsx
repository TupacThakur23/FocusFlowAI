

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error, errorInfo) {
    console.error('🚨 FocusFlow AI: React Error Boundary Caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack || 'No component stack available',
      errorBoundary: errorInfo?.boundary || 'No boundary info',
      timestamp: Date.now()
    });

    return { hasError: true, error, errorInfo };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });

    console.error('🚨 FocusFlow AI: Component Error Details', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      componentName: errorInfo?.componentStack || 'No component stack available',
      errorBoundary: errorInfo?.boundary || 'No boundary info',
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'REACT_ERROR',
        error: {
          message: error.message,
          stack: error.stack,
          component: errorInfo?.componentStack || 'No component stack available',
          timestamp: Date.now()
        }
      });
    }
  }

  render() {
    if (this.state.hasError) {

      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: '#0a0a0b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto'
        }}>
          <div style={{
            maxWidth: '400px',
            textAlign: 'center',
            background: '#1a1a1e',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #374151'
          }}>
            <h2 style={{ 
              color: '#ef4444', 
              margin: '0 0 20px 0',
              fontSize: '18px' 
            }}>
              ⚠️ FocusFlow AI
            </h2>
            
            <p style={{ 
              color: '#9ca3af', 
              margin: '0 0 15px 0',
              lineHeight: '1.5' 
            }}>
              The application encountered a rendering error.
            </p>
            
            <p style={{ 
              color: '#6b7280', 
              margin: '0 0 10px 0',
              fontSize: '14px' 
            }}>
              This has been logged and will be fixed automatically.
            </p>
            
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#374151',
              borderRadius: '8px'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Reload Extension
              </button>
            </div>
            
            {this.state.error && (
              <details style={{ 
                marginTop: '20px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  marginBottom: '10px',
                  color: '#9ca3af'
                }}>
                  Technical Details
                </summary>
                <div style={{ 
                  background: '#1f2937',
                  padding: '15px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}>
                  <strong>Error:</strong> {this.state.error.name}<br />
                  <strong>Message:</strong> {this.state.error.message}<br />
                  <strong>Stack:</strong><br />
                  {this.state.error.stack}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
