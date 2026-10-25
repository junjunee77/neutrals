/**
 * Neutral News AI - Node.js Express Backend Service
 * 
 * Features:
 *  - REST API for live crawled 5:5 balanced neutral newspaper articles
 *  - 4 Core Categories: [국내] [해외] [북한] [이색 해외]
 *  - Endpoints:
 *     GET  /api/health            -> Server health & uptime
 *     GET  /api/news              -> Current active 4-category news edition
 *     GET  /api/news/crawl        -> Live crawl foreign & domestic RSS and synthesize fresh edition
 *     GET  /api/news/archive      -> All stored editions library (16+ articles)
 *     POST /api/news/synthesize   -> Custom text/URL neutral article synthesis
 * 
 * Resilience:
 *  - Uses Express & CORS when dependencies are installed.
 *  - Seamlessly falls back to Node.js native HTTP server if run before 'npm install'.
 */

const { EDITIONS } = require('./editions');
const { crawlAllCategories, synthesizeNeutralArticle } = require('./crawler');

const PORT = process.env.PORT || 4000;

// State management
let editionsStore = [...EDITIONS];
let activeEditionIndex = 0;
let lastCrawledTime = null;

// Helper: Get active edition
function getActiveEdition() {
  return editionsStore[activeEditionIndex] || editionsStore[0];
}

// Controller logic
async function handleGetNews() {
  return {
    status: 'success',
    activeEditionIndex,
    currentEdition: getActiveEdition(),
    totalEditions: editionsStore.length,
    lastCrawledTime,
    categories: ['국내', '해외', '북한', '이색 해외']
  };
}

async function handleCrawlNews() {
  console.log('📡 [API Triggered] Crawling foreign & domestic RSS feeds...');
  try {
    const freshEdition = await crawlAllCategories(editionsStore);
    // Prepend fresh edition to editions store
    editionsStore.unshift(freshEdition);
    activeEditionIndex = 0;
    lastCrawledTime = freshEdition.crawledAt;

    return {
      status: 'success',
      message: '실시간 외신(로이터, BBC, 구글뉴스) RSS 크롤링 및 5:5 중립 신문 기사체 합성 완료',
      edition: freshEdition,
      totalEditions: editionsStore.length
    };
  } catch (err) {
    console.error('Crawl failed:', err);
    return {
      status: 'error',
      message: `크롤링 중 오류 발생: ${err.message}`,
      fallbackEdition: getActiveEdition()
    };
  }
}

function handleGetArchive() {
  return {
    status: 'success',
    totalEditions: editionsStore.length,
    editions: editionsStore
  };
}

function handleSynthesize(payload) {
  const { category = 'domestic', title = '', snippet = '', origin = '사용자 입력 기사' } = payload;
  const synthesized = synthesizeNeutralArticle(
    category,
    { title, description: snippet, source: origin },
    editionsStore[0].articles[0]
  );
  return {
    status: 'success',
    article: synthesized
  };
}

// -------------------------------------------------------------
// Server Initialization: Express or Native HTTP Fallback
// -------------------------------------------------------------
let expressApp = null;

try {
  const express = require('express');
  const cors = require('cors');

  expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  // Healthcheck
  expressApp.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Neutral News Express Backend',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // Current News
  expressApp.get('/api/news', async (req, res) => {
    const data = await handleGetNews();
    res.json(data);
  });

  // Trigger Live RSS Crawl
  expressApp.get('/api/news/crawl', async (req, res) => {
    const data = await handleCrawlNews();
    res.json(data);
  });

  // Archive Library
  expressApp.get('/api/news/archive', (req, res) => {
    res.json(handleGetArchive());
  });

  // Custom Synthesis
  expressApp.post('/api/news/synthesize', (req, res) => {
    res.json(handleSynthesize(req.body || {}));
  });

  expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 [Neutral News Express Backend] Server running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📰 API Endpoints:`);
    console.log(`   - GET  http://localhost:${PORT}/api/health`);
    console.log(`   - GET  http://localhost:${PORT}/api/news`);
    console.log(`   - GET  http://localhost:${PORT}/api/news/crawl`);
    console.log(`   - GET  http://localhost:${PORT}/api/news/archive`);
    console.log(`   - POST http://localhost:${PORT}/api/news/synthesize`);
    console.log(`=======================================================`);
  });

} catch (err) {
  // Graceful fallback to Node's built-in HTTP server
  console.log(`[Notice] Express/CORS not found (${err.message}). Starting with native Node.js HTTP server...`);
  const http = require('http');

  const server = http.createServer(async (req, res) => {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        service: 'Neutral News Native HTTP Backend (Zero-Dependency)',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
      return;
    }

    if (pathname === '/api/news' && req.method === 'GET') {
      const data = await handleGetNews();
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    if (pathname === '/api/news/crawl' && req.method === 'GET') {
      const data = await handleCrawlNews();
      res.writeHead(200);
      res.end(JSON.stringify(data));
      return;
    }

    if (pathname === '/api/news/archive' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(handleGetArchive()));
      return;
    }

    if (pathname === '/api/news/synthesize' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          res.writeHead(200);
          res.end(JSON.stringify(handleSynthesize(parsed)));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 [Neutral News Native HTTP Backend] Server running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📰 API Endpoints:`);
    console.log(`   - GET  http://localhost:${PORT}/api/health`);
    console.log(`   - GET  http://localhost:${PORT}/api/news`);
    console.log(`   - GET  http://localhost:${PORT}/api/news/crawl`);
    console.log(`   - GET  http://localhost:${PORT}/api/news/archive`);
    console.log(`   - POST http://localhost:${PORT}/api/news/synthesize`);
    console.log(`=======================================================`);
  });
}
