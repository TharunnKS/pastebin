import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasteUrl('');

    try {
      const body = {
        content
      };

      if (ttlSeconds) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        body.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setPasteUrl(data.url);
      // Clear form
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pastebin Lite</h1>
        <p style={styles.subtitle}>Store and share text with optional expiry</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {pasteUrl && (
        <div style={styles.successBox}>
          <button onClick={() => setPasteUrl('')} style={styles.closeButton}>
            ✕
          </button>
          <strong>Success!</strong> Your paste has been created.
          <div style={styles.urlBox}>
            <a href={pasteUrl} style={styles.urlLink} target="_blank" rel="noopener noreferrer">
              {pasteUrl}
            </a>
            <button onClick={handleCopy} style={styles.copyButton}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="content" style={styles.label}>
            Paste Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text here..."
            required
            rows={12}
            style={styles.textarea}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label htmlFor="ttl" style={styles.label}>
              Time to Live (seconds)
            </label>
            <input
              id="ttl"
              type="number"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="e.g., 3600 for 1 hour"
              min="1"
              style={styles.input}
            />
            <small style={styles.hint}>Optional: Paste expires after this time</small>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="maxViews" style={styles.label}>
              Max Views
            </label>
            <input
              id="maxViews"
              type="number"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g., 5"
              min="1"
              style={styles.input}
            />
            <small style={styles.hint}>Optional: Paste expires after this many views</small>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{
            ...styles.button,
            ...(loading || !content.trim() ? styles.buttonDisabled : {})
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Paste will become unavailable when either constraint (TTL or max views) is triggered.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '20px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: '0'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  successBox: {
    backgroundColor: '#d1fae5',
    border: '1px solid #10b981',
    color: '#065f46',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    position: 'relative'
  },
  urlBox: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '12px',
    wordBreak: 'break-all',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  urlLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    flex: '1'
  },
  copyButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s'
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#065f46',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'white',
    padding: '4px',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  form: {
    marginBottom: '30px'
  },
  formGroup: {
    marginBottom: '20px',
    flex: '1'
  },
  row: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"Courier New", Courier, monospace',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  hint: {
    display: 'block',
    marginTop: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0'
  }
};
