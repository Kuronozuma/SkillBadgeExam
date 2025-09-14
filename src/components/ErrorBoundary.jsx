import React, { Component } from 'react';
import Card from '../components/Card';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <div style={{
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              marginBottom: '10px', 
              color: 'var(--error)',
              fontSize: '22px'
            }}>
              Something went wrong
            </h3>
            <p style={{ 
              marginBottom: '20px',
              color: 'var(--error)',
              opacity: 0.8
            }}>
              We're sorry, but there was a problem loading this page.
            </p>
            
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '15px',
                padding: '10px 24px',
                background: '#66b2ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
            
            {this.props.showDetails && (
              <details style={{ 
                marginTop: '30px', 
                textAlign: 'left',
                background: 'rgba(255, 107, 107, 0.05)',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: 'var(--accent)', 
                  fontWeight: '500'
                }}>
                  Error Details
                </summary>
                <pre style={{ 
                  marginTop: '10px', 
                  background: 'rgba(0,0,0,0.1)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflowX: 'auto',
                  color: 'var(--error)',
                  fontSize: '14px'
                }}>
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;