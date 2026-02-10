// ============================================
// CLOUDFLARE PAGES MIDDLEWARE
// Handle /api/* proxy ke backend
// ============================================

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // ============================================
  // HANYA HANDLE /api/*
  // ============================================
  if (!url.pathname.startsWith('/api/')) {
    return next(); // Pass ke handler berikutnya (static files)
  }
  
  // CONFIG
  const BACKEND_URL = 'http://103.196.153.124:5000';
  const BACKEND_SECRET = 'kKCMbTthzs1kNmpKiJpwQEe6v0SAvYMAmwf7dQhNP_I';
  
  console.log(`[MIDDLEWARE] ${request.method} ${url.pathname}`);
  
  // ============================================
  // CORS PREFLIGHT
  // ============================================
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
  
  // ============================================
  // PROXY KE BACKEND
  // ============================================
  const backendUrl = BACKEND_URL + url.pathname + url.search;
  
  const headers = new Headers(request.headers);
  headers.set('X-Netlify-Secret', BACKEND_SECRET);
  headers.delete('Host');
  
  console.log(`[MIDDLEWARE] Backend: ${backendUrl}`);
  
  try {
    const backendRequest = new Request(backendUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? await request.arrayBuffer() 
        : null,
    });
    
    const response = await fetch(backendRequest);
    const responseBody = await response.arrayBuffer();
    
    console.log(`[MIDDLEWARE] Status: ${response.status}`);
    
    const newResponse = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    // Add CORS
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Netlify-Secret');
    
    return newResponse;
    
  } catch (error) {
    console.error(`[MIDDLEWARE] Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: 'Backend unreachable',
        message: error.message,
        backend_url: backendUrl,
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