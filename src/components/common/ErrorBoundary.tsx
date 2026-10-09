import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('⚠️ [Sufrah App Error caught by ErrorBoundary]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleClearAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-cairo select-none" dir="rtl">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-bold text-white">تحديث بيانات المنصة</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              تم تسجيل تحديث في النظام ومزامنة البيانات. يرجى الضغط أدناه لتحديث الصفحة فوراً.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>متابعة ودخول إلى المنيو</span>
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الذاكرة المؤقتة (Fresh Reload)</span>
              </button>
            </div>

            {this.state.error && (
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
                >
                  {this.state.showDetails ? 'إخفاء تفاصيل الخطأ' : 'عرض التفاصيل الفنية للخطأ'}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-rose-400 font-mono overflow-x-auto whitespace-pre-wrap text-left" dir="ltr">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

