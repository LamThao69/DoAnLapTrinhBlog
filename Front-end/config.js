/**
 * API Configuration
 * Automatically detects environment and sets correct API base URL
 */

const API_BASE = (() => {
  const hostname = window.location.hostname;
  
  // Development: localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  
  // Production: Detect from window location or use Render URL
  // Render: static site served from blog-frontend-xyz.onrender.com
  // Backend: blog-backend-xyz.onrender.com
  // Replace both 'xyz' parts with your actual Render IDs
  
  if (hostname.includes('render')) {
    // Auto-detect: if frontend is on render, backend should also be on render
    const backendUrl = 'https://blog-backend-hlje.onrender.com';
    return backendUrl;
  }
  
  // Custom domain: https://yourdomain.com → https://api.yourdomain.com
  return `https://api.${hostname}`;
})();

// Make API_BASE available globally
window.API_BASE = API_BASE;
console.log('[Config] Using API_BASE:', API_BASE);

