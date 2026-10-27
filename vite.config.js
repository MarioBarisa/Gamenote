import { defineConfig, loadEnv } from "vite";
import { createRequire } from "node:module";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

// Dev-only PSN auth+relay middleware.
function psnDevServer() {
  const require = createRequire(import.meta.url);
  const { psnExchange } = require("./netlify/functions/lib/_psnExchange.js");
  const { psnRelay } = require("./netlify/functions/lib/_psnRelay.js");

  const respond = (res, statusCode, body) => {
    res.statusCode = statusCode;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify(body));
  };

  return {
    name: "psn-dev-server",
    configureServer(server) {
      server.middlewares.use("/.netlify/functions/psn-auth", async (req, res) => {
        if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });

        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (body.length > 8192) return respond(res, 413, { error: "Zahtjev prevelik." });
        }

        let payload;
        try {
          payload = body ? JSON.parse(body) : {};
        } catch {
          return respond(res, 400, { error: "Neispravan zahtjev." });
        }
        if (!payload || typeof payload !== "object") return respond(res, 400, { error: "Neispravan zahtjev." });

        const result = await psnExchange(payload);
        return respond(res, result.ok ? 200 : result.status, result.ok ? result.tokens : { error: result.error });
      });

      // req.url bez mount prefiksa
      server.middlewares.use("/.netlify/functions/psn-relay", async (req, res) => {
        const m = req.method;
        if (m !== "GET" && m !== "POST") return respond(res, 405, { error: "Method not allowed" });

        let body = null;
        if (m === "POST") {
          let raw = "";
          for await (const chunk of req) {
            raw += chunk;
            if (raw.length > 65536) return respond(res, 413, { error: "Zahtjev prevelik." });
          }
          body = raw;
        }

        const result = await psnRelay(req.url || "/", req.headers["authorization"], { method: m, body });
        if (!result.ok) return respond(res, result.status, { error: result.error });
        res.statusCode = result.status;
        res.setHeader("content-type", result.contentType);
        res.setHeader("cache-control", "no-store");
        res.end(result.body);
      });
    },
  };
}

function steamDevServer(env) {
  const require = createRequire(import.meta.url);
  const { steamRelay } = require('./netlify/functions/lib/_steamRelay.js');
  return {
    name: 'steam-dev-server',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/steam', async (req, res) => {
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.setHeader('cache-control', 'no-store');
        function respond(status, data) {
          res.statusCode = status;
          res.end(JSON.stringify(data));
        }
        if (req.method !== 'POST') return respond(405, { error: 'Metoda nije dopuštena.' });
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 4096) return respond(413, { error: 'Zahtjev je prevelik.' });
        }
        let payload;
        try {
          payload = JSON.parse(body || '{}');
        } catch {
          return respond(400, { error: 'Neispravan zahtjev.' });
        }
        const result = await steamRelay(payload, req.headers.authorization, { env });
        return respond(result.ok ? 200 : result.status, result.ok ? result.data : { error: result.error });
      });
    },
  };
}

function appApiDevServer(env) {
  const require = createRequire(import.meta.url);
  const { appApi } = require('./netlify/functions/lib/_appApi.js');
  return {
    name: 'app-api-dev-server',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/app-api', async (req, res) => {
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.setHeader('cache-control', 'no-store');
        const respond = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
        if (req.method !== 'POST') return respond(405, { error: 'Metoda nije dopuštena.' });
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 4300000) return respond(413, { error: 'Zahtjev je prevelik.' });
        }
        let payload;
        try { payload = JSON.parse(body || '{}'); }
        catch { return respond(400, { error: 'Neispravan zahtjev.' }); }
        const result = await appApi(payload, req.headers.authorization, { env, ip: req.socket.remoteAddress });
        respond(result.status, result.data);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'hover-tilt',
        },
      },
    }),
    psnDevServer(),
    appApiDevServer({ ...loadEnv(mode, process.cwd(), ''), ...process.env }),
    steamDevServer({ ...loadEnv(mode, process.cwd(), ''), ...process.env }),
  ],
  server: {
    proxy: {
      '/api/rawg': {
        target: 'https://api.rawg.io/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rawg/, ''),
         secure: false,
      },
    }
  }
}));
