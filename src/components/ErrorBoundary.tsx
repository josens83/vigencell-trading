'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고
 * 충돌 대신 폴백 UI를 표시합니다.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // 에러 로깅
    logError(error, {
      componentStack: errorInfo.componentStack || undefined,
      boundary: 'ErrorBoundary',
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full game-card p-8 text-center">
            <div className="text-6xl mb-4" role="img" aria-label="에러">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              문제가 발생했습니다
            </h1>
            <p className="text-gray-400 mb-6">
              예기치 않은 오류가 발생했습니다.
              <br />
              문제가 지속되면 페이지를 새로고침 해주세요.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
                  에러 상세 정보 보기
                </summary>
                <div className="mt-2 p-4 bg-slate-800 rounded-lg overflow-auto max-h-48">
                  <p className="text-red-400 text-sm font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 게임 전용 에러 바운더리
 * 게임 컴포넌트에서 발생하는 에러를 처리합니다.
 */
export function GameErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full game-card p-8 text-center">
            <div className="text-6xl mb-4" role="img" aria-label="게임 에러">
              🎮
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              게임 오류
            </h1>
            <p className="text-gray-400 mb-6">
              게임 진행 중 문제가 발생했습니다.
              <br />
              게임을 다시 시작하거나 저장된 게임을 불러와 주세요.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/game"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                새 게임
              </a>
              <a
                href="/dashboard"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                대시보드
              </a>
            </div>
          </div>
        </div>
      }
      onError={(error) => {
        logError(error, { context: 'game' });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
