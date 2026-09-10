import { Component } from "react";
import { ErrorState } from "./ErrorState";

export class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.label || "section"}] render error:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={`Unable to load ${this.props.label || "this section"}`}
          message="Something went wrong rendering this section."
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
