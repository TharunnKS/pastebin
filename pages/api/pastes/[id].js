const { fetchAndDecrementPaste, getNow } = require('../../../lib/db');

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Paste ID is required' });
    }

    // Get current time (respecting TEST_MODE)
    const now = getNow(req);

    // Fetch and decrement paste atomically
    const paste = await fetchAndDecrementPaste(id, now);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or no longer available' });
    }

    // Prepare response
    const response = {
      content: paste.content,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at ? paste.expires_at.toISOString() : null
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching paste:', error);
    return res.status(500).json({ error: 'Failed to fetch paste' });
  }
}
