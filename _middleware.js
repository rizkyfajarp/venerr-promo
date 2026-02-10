// ============================================
// CLOUDFLARE PAGES MIDDLEWARE
// ============================================

export async function onRequest(context) {
  return handleRequest(context);
}

async function handleRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Skip kalau bukan /api/*
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }
  
  // CONFIG
  const BACKEND_URL = 'http://103.196.153.124:5000/api';
  const BACKEND_SECRET = 'kKCMbTthzs1kNmpKiJpwQEe6v0SAvYMAmwf7dQhNP_I';
  
  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Netlify-Secret, ngrok-skip-browser-warning',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  // Build backend URL
  const backendUrl = BACKEND_URL + url.pathname + url.search;
  
  // Clone headers
  const headers = new Headers(request.headers);
  headers.set('X-Netlify-Secret', BACKEND_SECRET);
  headers.delete('Host');
  
  try {
    // Clone body
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.arrayBuffer();
    }
    
    // Forward request
    const backendRequest = new Request(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });
    
    // Fetch from backend
    const response = await fetch(backendRequest);
    
    // Clone response
    const responseBody = await response.arrayBuffer();
    const newResponse = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
    
    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Netlify-Secret, ngrok-skip-browser-warning');
    
    return newResponse;
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Backend unreachable',
        message: error.message,
        backend: BACKEND_URL,
      }), 
      {
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}