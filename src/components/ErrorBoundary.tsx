// src/components/ErrorBoundary.tsx
// Last line of defense: a render error anywhere below this shows a short
// bilingual message instead of a blank white page. Logs to the console so the
// cause is still visible in devtools.

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cal px-6 text-center">
        <p className="font-heading text-2xl text-mesquite">Something went wrong · Algo salió mal</p>
        <p className="mt-3 max-w-md font-serif italic text-mesquite/70">
          Try reloading the page. · Intenta recargar la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-sm bg-ocre px-6 py-2 font-heading text-sm text-cal transition hover:bg-mesquite"
        >
          Reload · Recargar
        </button>
      </div>
    );
  }
}
