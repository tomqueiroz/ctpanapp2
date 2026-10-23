import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    // Never display stack traces, session data or request payloads to visitors.
    console.error('Falha ao abrir página do LMS', info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="container mx-auto max-w-xl px-4 py-12 text-center" role="alert">
          <h1 className="mb-3 text-xl">Não foi possível abrir esta página</h1>
          <p className="mb-6 text-muted-foreground">
            Verifique sua conexão e tente novamente. Os dados já salvos no sistema são mantidos.
          </p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          <a className="ml-4 underline" href="/dashboard">Voltar ao painel</a>
        </div>
      );
    }
    return this.props.children;
  }
}
