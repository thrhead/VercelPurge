import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy to Vercel API to bypass CORS
  app.all('/api/vercel/*', async (req, res) => {
    try {
      const vercelPath = req.params[0];
      const vercelUrl = `https://api.vercel.com/${vercelPath}`;
      
      const queryParams = new URLSearchParams(req.query as any).toString();
      const finalUrl = queryParams ? `${vercelUrl}?${queryParams}` : vercelUrl;

      const headers = new Headers();
      if (req.headers.authorization) {
        headers.set('Authorization', req.headers.authorization);
      }
      
      const response = await fetch(finalUrl, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
      });
      
      const data = await response.json().catch(() => ({}));
      res.status(response.status).json(data);
    } catch (e) {
      console.error("Vercel Proxy Error:", e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
