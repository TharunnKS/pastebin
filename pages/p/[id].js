import { getPasteForView, getNow } from '../../lib/db';

export default function PastePage({ paste, error }) {
  if (error || !paste) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h1 style={styles.errorTitle}>404 - Paste Not Found</h1>
          <p style={styles.errorText}>
            This paste does not exist or is no longer available.
          </p>
          <a href="/" style={styles.link}>← Go back home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pastebin Lite</h1>
        <div style={styles.meta}>
          {paste.remaining_views !== null && (
            <span style={styles.badge}>
              {paste.remaining_views} view{paste.remaining_views !== 1 ? 's' : ''} remaining
            </span>
          )}
          {paste.expires_at && (
            <span style={styles.badge}>
              Expires: {new Date(paste.expires_at).toLocaleString('en-US', { 
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </span>
          )}
        </div>
      </div>
      <div style={styles.contentBox}>
        <pre style={styles.pre}>{paste.content}</pre>
      </div>
      <div style={styles.footer}>
        <a href="/" style={styles.link}>Create new paste</a>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, params }) {
  try {
    const { id } = params;
    
    // Get current time (respecting TEST_MODE)
    const now = getNow(req);
    
    // Fetch paste (this also decrements views)
    const paste = await getPasteForView(id, now);
    
    if (!paste) {
      return {
        props: {
          error: 'Paste not found',
          paste: null
        },
        // Set 404 status
        notFound: true
      };
    }
    
    // Serialize dates to ISO strings for Next.js
    const serializedPaste = {
      content: paste.content,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at || null
    };
    
    return {
      props: {
        paste: serializedPaste,
        error: null
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        error: 'Failed to load paste',
        paste: null
      },
      notFound: true
    };
  }
}

// Inline styles for simplicity (no external CSS needed)
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    marginBottom: '20px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 10px 0'
  },
  meta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500'
  },
  contentBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    overflow: 'auto'
  },
  pre: {
    margin: '0',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    color: '#1f2937'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500'
  },
  errorBox: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  errorTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: '16px'
  },
  errorText: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '24px'
  }
};
