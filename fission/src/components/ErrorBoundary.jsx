import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="screen" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400 }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: '30rem' }}>
            {this.state.error.message}
          </p>
          <button
            className="primary-button"
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            RELOAD GAME
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
