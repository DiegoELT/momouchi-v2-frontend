import { Component } from "react";

/**
 * Without this, any error thrown during render unmounts the entire app and the
 * annotator is left staring at a blank white page — with unsaved annotations
 * still in memory and no way to get them back.
 *
 * Catching the error keeps the rest of the page mounted and tells them to save.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="border-2 border-red-400 bg-red-50 text-red-900 rounded p-4 m-2">
        <p className="font-semibold mb-1">
          {this.props.label || "Something broke while rendering."}
        </p>
        <p className="text-sm mb-2">
          Your annotations are still loaded — use <strong>Save JSON</strong>{" "}
          before reloading the page.
        </p>
        <pre className="text-xs bg-white/70 p-2 rounded overflow-x-auto">
          {String(this.state.error?.message || this.state.error)}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }
}
