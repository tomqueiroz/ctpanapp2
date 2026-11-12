import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { RouteErrorBoundary } from './RouteErrorBoundary';

function BrokenPage(): React.ReactNode {
  throw new Error('test route failure');
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('route recovery', () => {
  it('shows a recovery screen and lets a different route render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const view = render(<RouteErrorBoundary key="/broken"><BrokenPage /></RouteErrorBoundary>);
    expect(screen.getByRole('alert').textContent).toContain('Não foi possível abrir esta página');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
    view.rerender(<RouteErrorBoundary key="/courses"><h1>Curso disponível</h1></RouteErrorBoundary>);
    expect(screen.getByRole('heading', { name: 'Curso disponível' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
