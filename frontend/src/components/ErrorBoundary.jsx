import { Component } from "react";

/**
 * Keeps one broken subtree from taking down the whole page.
 *
 * React unmounts the entire tree on an uncaught render error, so without a
 * boundary a single failing decorative component (e.g. the WebGL hero cube in
 * a browser with no GPU, like a Zscaler/remote-isolation session) leaves the
 * visitor staring at a blank page. Wrap anything non-essential in this.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Non-fatal by definition — log it and keep the rest of the page alive.
    console.warn("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
