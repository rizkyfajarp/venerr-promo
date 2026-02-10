// ============================================
// CLOUDFLARE PAGES FUNCTION
// Handle semua request ke /api/*
// ============================================

export async function onRequest(context) {
  const { request } = context;
  
  // CONFIG
  const BACKEND_URL = 'http://103.196.153.124:5000';
  const BACKEND_SECRET = 'kKCMbTthzs1kNmpKiJpwQEe6v0SAvYMAmwf7dQhNP_I';
  
  const url = new URL(request.url);
  
  console.log(`[FUNCTION] ${request.method} ${url.pathname}`);
  
  // ============================================
  // CORS PREFLIGHT
  // ============================================
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Netlify-Secret, ngrok-skip-browser-warning, Cache-Control, Accept',
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
  
  console.log(`[FUNCTION] Backend URL: ${backendUrl}`);
  
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
    
    console.log(`[FUNCTION] Backend status: ${response.status}`);
    
    const newResponse = new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    // Add CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Netlify-Secret, ngrok-skip-browser-warning, Cache-Control, Accept');
    
    return newResponse;
    
  } catch (error) {
    console.error(`[FUNCTION] Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: 'Backend unreachable',
        message: error.message,
        backend_url: backendUrl,
        timestamp: new Date().toISOString(),
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