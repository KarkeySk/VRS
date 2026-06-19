import { Component } from 'react'

/**
 * Catches render/runtime errors in the subtree so a single page crash shows a
 * readable message instead of white-screening the whole dashboard.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-3 p-10 min-h-[300px]">
          <h2 className="text-lg font-bold m-0">Something went wrong on this page</h2>
          <p className="text-sm text-txt-secondary max-w-md m-0">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 text-sm rounded-md border border-dark-border text-txt-secondary hover:text-brand-orange hover:border-brand-orange"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-action px-4 py-2 text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
