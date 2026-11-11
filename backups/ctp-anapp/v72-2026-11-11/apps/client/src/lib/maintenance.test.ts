// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { readSavedTheme, saveTheme } from './theme-storage';
import { createSingleFlight } from './single-flight';
import { sanitizeCourseHtml } from '../components/SafeCourseHtml';

afterEach(() => vi.unstubAllGlobals());

describe('proteções de manutenção', () => {
  it('não falha com armazenamento bloqueado', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('blocked'); } });
    expect(readSavedTheme()).toBe('light');
    expect(() => saveTheme('dark')).not.toThrow();
  });

  it('ignora valores inválidos de tema', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => 'invalid' } });
    expect(readSavedTheme()).toBe('light');
    vi.stubGlobal('window', { localStorage: { getItem: () => 'dark' } });
    expect(readSavedTheme()).toBe('dark');
  });

  it('permite somente um envio simultâneo e libera nova tentativa após erro', () => {
    const gate = createSingleFlight();
    expect(gate.tryAcquire()).toBe(true);
    expect(gate.tryAcquire()).toBe(false);
    gate.release();
    expect(gate.tryAcquire()).toBe(true);
  });

  it('remove scripts, eventos, URL javascript e conteúdo executável sem apagar o texto', () => {
    const html = sanitizeCourseHtml(
      '<h2>Conteúdo</h2><p>Estude os testes.</p><script>alert(1)</script>' +
      '<img src="/images/test.png" onerror="alert(1)">' +
      '<a href="javascript:alert(1)">Texto</a><iframe srcdoc="<script>alert(1)</script>"></iframe>',
    );
    expect(html).toContain('<h2>Conteúdo</h2>');
    expect(html).toContain('Estude os testes.');
    expect(html).not.toMatch(/<script|onerror|javascript:|<iframe|srcdoc/i);
  });
});
