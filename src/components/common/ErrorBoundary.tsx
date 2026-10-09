import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 bg-slate-900 border border-slate-700 rounded-2xl text-center space-y-4 max-w-lg mx-auto text-white shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">
            {this.props.fallbackTitle || 'Ocurrió un contratiempo al cargar la sección'}
          </h3>
          <p className="text-xs text-slate-300">
            {this.state.error?.message || 'Hubo un error inesperado al renderizar este módulo en la aplicación.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer transition active:scale-95 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar Módulo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
