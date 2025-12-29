const { nanoid } = require('nanoid');
const { createPaste, getNow } = require('../../../lib/db');

export default async function handler(req, res) {
  // Handle POST - Create paste
  if (req.method === 'POST') {
    try {
      const { content, ttl_seconds, max_views } = req.body;

      // Validate content
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
      }

      // Validate ttl_seconds
      if (ttl_seconds !== undefined && ttl_seconds !== null) {
        if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
          return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
        }
      }

      // Validate max_views
      if (max_views !== undefined && max_views !== null) {
        if (!Number.isInteger(max_views) || max_views < 1) {
          return res.status(400).json({ error: 'max_views must be an integer >= 1' });
        }
      }

      // Generate unique ID
      const id = nanoid(10);

      // Calculate expiry time if TTL is provided
      const now = getNow(req);
      const expiresAt = ttl_seconds ? new Date(now.getTime() + ttl_seconds * 1000) : null;
      const remainingViews = max_views || null;

      // Create paste in database
      await createPaste(id, content, expiresAt, remainingViews);

      // Get the base URL from the request
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      // Return response
      return res.status(201).json({
        id,
        url: `${baseUrl}/p/${id}`
      });
    } catch (error) {
      console.error('Error creating paste:', error);
      return res.status(500).json({ error: 'Failed to create paste' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
