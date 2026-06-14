import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RestaurantProvider } from './data/store.tsx';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "#800F14", backgroundColor: "#FFF5F5", border: "2px solid #EE3124", borderRadius: "12px", margin: "20px", fontFamily: "sans-serif" }}>
          <h2 style={{ margin: "0 0 10px 0" }}>Hệ thống gặp sự cố hiển thị (React Crash)</h2>
          <p style={{ fontSize: "14px", color: "#666" }}>Vui lòng chụp ảnh lỗi này để đội kỹ thuật hỗ trợ:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#FFF", padding: "12px", border: "1px solid #FFC1C1", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto" }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RestaurantProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </RestaurantProvider>
  </StrictMode>,
);
