import React, { ErrorInfo } from "react";
import { AlertOctagon, RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 flex flex-col gap-5 text-center">
            <div className="mx-auto p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-400">
              <AlertOctagon className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-bold text-white tracking-tight">애플리케이션에 오류가 발생했습니다</h2>
              <p className="text-xs text-slate-400">
                렌더링 중 예상치 못한 오류가 감지되었습니다. 아래의 세부 정보를 확인하거나 앱 데이터를 초기화하여 해결해 보세요.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-rose-400 max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                <div className="flex items-center gap-1 text-slate-300 font-bold border-b border-slate-800 pb-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Error Message:</span>
                </div>
                {this.state.error.toString()}
                {this.state.error.stack && (
                  <span className="text-slate-500 block mt-2 text-[9px]">{this.state.error.stack}</span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>데이터 초기화 및 새로고침</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
              >
                단순 페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
