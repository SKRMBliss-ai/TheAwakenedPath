import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.featureName || 'Component'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-12 text-center rounded-[40px] border border-red-500/20 bg-red-500/5 backdrop-blur-3xl animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 shadow-2xl shadow-red-500/20">
            <AlertTriangle size={32} className="text-red-500 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">
            The Flow encountered a ripple
          </h2>
          
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-10 leading-relaxed font-serif italic">
            This part of the journey is momentarily untethered. Let us return to center and try again.
          </p>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl text-[var(--text-primary)]"
          >
            <RefreshCcw size={14} className="text-red-500" />
            Restore Balance
          </button>

          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
            <div className="mt-8 p-4 rounded-xl bg-black/20 border border-white/5 text-left w-full max-w-2xl overflow-auto custom-scrollbar">
              <p className="text-[10px] font-mono text-red-400 mb-2">Technical Insight:</p>
              <p className="text-[11px] font-mono text-white/40">{this.state.error?.message}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
