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

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800/80 rounded-xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-950 border border-rose-600 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Error Intercepted</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                An unexpected interface failure occurred while rendering this module.
              </p>
              {this.state.error && (
                <div className="mt-3 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-rose-400 text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Emergency Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
