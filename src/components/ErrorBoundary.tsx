import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'sans-serif',
          background: '#0F1C20',
          color: '#F0F8F8',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#FF5C5C', marginTop: 0 }}>Application Error Encountered</h2>
          <p style={{ color: '#A0B4B8' }}>The application encountered an unexpected runtime error:</p>
          <pre style={{
            background: '#182A30',
            padding: '16px',
            borderRadius: '8px',
            color: '#FF8888',
            overflowX: 'auto',
            fontSize: '14px'
          }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          {this.state.errorInfo && (
            <details style={{ marginTop: '16px', color: '#80A0A8' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Stack Trace</summary>
              <pre style={{
                background: '#142226',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                overflowX: 'auto'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '24px',
              padding: '10px 20px',
              background: '#1E8282',
              color: '#FFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reset Session &amp; Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
