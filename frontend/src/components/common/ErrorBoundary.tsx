import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            <div className="font-semibold">Something went wrong</div>
            <div className="mt-1 text-sm">{this.state.error.message}</div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
