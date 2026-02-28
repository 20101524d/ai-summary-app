import { useState, useEffect } from 'react'

const styles = {
  main: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '20px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  title: {
    color: '#1a1a1a',
    marginBottom: '24px',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  uploadSection: {
    marginBottom: '28px',
  },
  uploadLabel: {
    display: 'block',
  },
  fileInput: {
    display: 'none',
  },
  uploadButton: {
    display: 'inline-block',
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  flexContainer: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  fileListSection: {
    flex: '0 0 280px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    color: '#1a1a1a',
    marginTop: '0',
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: '600',
  },
  emptyMessage: {
    color: '#888',
    fontSize: '14px',
    margin: '20px 0',
  },
  fileList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  fileItem: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #eee',
  },
  fileNameContainer: {
    marginBottom: '8px',
  },
  fileName: {
    cursor: 'pointer',
    color: '#0066cc',
    fontSize: '14px',
    fontWeight: '500',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '4px 0',
    transition: 'color 0.2s',
  },
  fileNameActive: {
    color: '#004499',
    fontWeight: 'bold',
  },
  fileActions: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    padding: '6px 12px',
    backgroundColor: '#cc3333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  detailSection: {
    flex: '1 1 640px',
    minWidth: '320px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  detailTitle: {
    color: '#1a1a1a',
    marginTop: '0',
    marginBottom: '0',
    fontSize: '18px',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#888',
    padding: '0 8px',
  },
}

export default function Home() {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function fetchFiles() {
    const res = await fetch('/api/files')
    const json = await res.json()
    setFiles(json.files || [])
  }

  useEffect(() => { fetchFiles() }, [])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/files', { method: 'POST', body: fd })
    if (res.ok) {
      await fetchFiles()
    } else {
      const err = await res.json()
      alert(err?.error || 'Upload failed')
    }
    setUploading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this file?')) return
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' })
    if (res.ok) fetchFiles()
    else alert('Delete error')
    if (selected && selected.id === id) setSelected(null)
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>File Manager</h1>
        
        <div style={styles.uploadSection}>
          <label style={styles.uploadLabel}>
            <input 
              type="file" 
              onChange={handleUpload} 
              disabled={uploading}
              accept=".pdf,.md,.txt"
              style={styles.fileInput}
            />
            <span style={styles.uploadButton}>
              {uploading ? '⏳ Uploading...' : '📁 Choose File (PDF, MD, TXT)'}
            </span>
          </label>
        </div>

        <div style={styles.flexContainer}>
          <section style={styles.fileListSection}>
            <h2 style={styles.sectionTitle}>Files ({files.length})</h2>
            {files.length === 0 && <p style={styles.emptyMessage}>No files uploaded yet</p>}
            <ul style={styles.fileList}>
              {files.map(f => (
                <li key={f.id} style={styles.fileItem}>
                  <div style={styles.fileNameContainer}>
                    <span 
                      onClick={() => setSelected(f)} 
                      style={{...styles.fileName, ...(selected?.id === f.id ? styles.fileNameActive : {})}}
                    >
                      📄 {f.name}
                    </span>
                  </div>
                  <div style={styles.fileActions}>
                    <button 
                      onClick={() => setSelected(f)}
                      style={styles.viewButton}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDelete(f.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {selected && (
            <section style={styles.detailSection}>
              <div style={styles.detailHeader}>
                <h2 style={styles.detailTitle}>{selected.name}</h2>
                <button 
                  onClick={() => setSelected(null)}
                  style={styles.closeButton}
                >
                  ✕
                </button>
              </div>
              <Tabs file={selected} />
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

function Tabs({ file }) {
  const [tab, setTab] = useState('preview')
  const { type, url, text, name } = file
  const isPDF = type === 'application/pdf' || name.endsWith('.pdf')
  const isMD = name.endsWith('.md')
  const isTXT = name.endsWith('.txt')
  
  const tabStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    tabButtons: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      borderBottom: '1px solid #eee',
    },
    tabButton: {
      padding: '10px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#666',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s',
    },
    tabButtonActive: {
      color: '#0066cc',
      borderBottom: '2px solid #0066cc',
    },
    viewerContainer: {
      border: '1px solid #eee',
      borderRadius: '4px',
      height: '60vh',
      overflow: 'auto',
      backgroundColor: '#fff',
    },
    iframeStyle: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
    preStyle: {
      margin: '0',
      padding: '16px',
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#333',
      backgroundColor: '#f9f9f9',
      overflow: 'auto',
    },
    markdownStyle: {
      padding: '16px',
      fontSize: '14px',
      lineHeight: '1.6',
    },
  }

  return (
    <div style={tabStyles.container}>
      <div style={tabStyles.tabButtons}>
        {(isPDF || isMD) && (
          <button 
            onClick={() => setTab('preview')}
            style={{
              ...tabStyles.tabButton,
              ...(tab === 'preview' ? tabStyles.tabButtonActive : {})
            }}
          >
            {isPDF ? '📄 PDF Preview' : '👁️ Preview'}
          </button>
        )}
        <button 
          onClick={() => setTab('text')}
          style={{
            ...tabStyles.tabButton,
            ...(tab === 'text' ? tabStyles.tabButtonActive : {})
          }}
        >
          📝 Text
        </button>
      </div>
      
      <div style={tabStyles.viewerContainer}>
        {tab === 'preview' && isPDF && (
          <iframe src={url} style={tabStyles.iframeStyle} title="PDF Viewer" />
        )}
        {tab === 'preview' && isMD && (
          <div style={tabStyles.markdownStyle} dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
        )}
        {tab === 'text' && (
          <pre style={tabStyles.preStyle}>{text || 'No text available'}</pre>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(md) {
  const mdlib = require('markdown-it')()
  return mdlib.render(md || '')
}
