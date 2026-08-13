import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              An unexpected application error occurred. We've captured the error diagnostics.
            </p>
            {this.state.error && (
              <pre className="text-[11px] p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
