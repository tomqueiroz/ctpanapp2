import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { syncAuthTokenFromUrl } from "@/lib/api";

// Prerender (scripts/prerender.mjs) bakes the home page into #root at build time
// so crawlers and the first paint see real content. The prerender uses a
// build-time safety transform that is intentionally different from the browser
// bundle, so the client replaces that static snapshot instead of hydrating it.
const rootEl = document.getElementById("root")!;

async function bootstrap() {
  try {
    await Promise.race([
      syncAuthTokenFromUrl(),
      new Promise<void>((resolve) => window.setTimeout(resolve, 2500)),
    ]);
  } catch (error) {
    console.error("Não foi possível sincronizar o token inicial:", error);
  }
  rootEl.replaceChildren();
  createRoot(rootEl).render(<App />);
}

void bootstrap();
