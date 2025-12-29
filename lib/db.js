const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with service role (for server-side operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Get current time respecting TEST_MODE for deterministic testing
 * @param {Object} req - HTTP request object with headers
 * @returns {Date} Current time or test time from x-test-now-ms header
 */
function getNow(req) {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    const timestamp = Number(req.headers['x-test-now-ms']);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  return new Date();
}

/**
 * Test database connectivity
 * @returns {Promise<boolean>} True if database is accessible
 */
async function checkHealth() {
  try {
    const { data, error } = await supabase
      .from('pastes')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Create a new paste
 * @param {string} id - Unique paste ID
 * @param {string} content - Paste content
 * @param {Date|null} expiresAt - Optional expiry timestamp
 * @param {number|null} remainingViews - Optional view limit
 * @returns {Promise<Object>} Created paste object
 */
async function createPaste(id, content, expiresAt, remainingViews) {
  const { data, error } = await supabase
    .from('pastes')
    .insert({
      id,
      content,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      remaining_views: remainingViews
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Fetch and decrement a paste atomically using Supabase RPC
 * @param {string} id - Paste ID
 * @param {Date} now - Current time for expiry check
 * @returns {Promise<Object|null>} Paste object or null if unavailable
 */
async function fetchAndDecrementPaste(id, now) {
  // First, fetch the paste
  const { data: paste, error: fetchError } = await supabase
    .from('pastes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !paste) {
    return null;
  }

  // Check expiry
  if (paste.expires_at && new Date(paste.expires_at) <= now) {
    return null;
  }

  // Check if views exhausted
  if (paste.remaining_views !== null && paste.remaining_views <= 0) {
    return null;
  }

  // Decrement remaining_views if applicable
  if (paste.remaining_views !== null) {
    const { data: updatedPaste, error: updateError } = await supabase
      .from('pastes')
      .update({ remaining_views: paste.remaining_views - 1 })
      .eq('id', id)
      .eq('remaining_views', paste.remaining_views) // Optimistic locking
      .select()
      .single();

    if (updateError || !updatedPaste) {
      // Race condition or paste already updated, try again
      return fetchAndDecrementPaste(id, now);
    }

    return updatedPaste;
  }

  return paste;
}

/**
 * Fetch a paste for HTML viewing (also decrements views)
 * @param {string} id - Paste ID
 * @param {Date} now - Current time for expiry check
 * @returns {Promise<Object|null>} Paste object or null if unavailable
 */
async function getPasteForView(id, now) {
  return fetchAndDecrementPaste(id, now);
}

module.exports = {
  supabase,
  getNow,
  checkHealth,
  createPaste,
  fetchAndDecrementPaste,
  getPasteForView
};
