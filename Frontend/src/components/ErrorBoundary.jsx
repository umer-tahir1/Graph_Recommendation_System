import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // Auto-reset after catching error to prevent reload loop
    setTimeout(() => {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null })
      }
    }, 100)
  }

  render() {
    if (this.state.hasError) {
      return null // Return null to prevent showing error UI
    }

    return this.props.children
  }
}

export default ErrorBoundary
