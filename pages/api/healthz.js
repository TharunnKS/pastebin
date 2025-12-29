const { checkHealth } = require('../../lib/db');

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isHealthy = await checkHealth();
    
    if (isHealthy) {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(503).json({ ok: false, error: 'Database unavailable' });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(503).json({ ok: false, error: 'Service unavailable' });
  }
}
