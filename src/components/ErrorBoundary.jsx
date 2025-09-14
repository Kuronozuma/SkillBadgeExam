import React, { Component } from 'react';
import Card from '../components/Card';
import '../styles/components/ErrorBoundary.css'

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
          <div className="error-boundary">
            <h3>
              Something went wrong
            </h3>
            <p>
              We're sorry, but there was a problem loading this page.
            </p>
            
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
            
            {this.props.showDetails && (
              <details className="error-details">
                <summary>
                  Error Details
                </summary>
                <pre>
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