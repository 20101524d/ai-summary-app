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
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [showPromptSettings, setShowPromptSettings] = useState(false)
  const [savingPrompt, setSavingPrompt] = useState(false)

  const { type, url, text, name } = file
  const isPDF = type === 'application/pdf' || name.endsWith('.pdf')
  const isMD = name.endsWith('.md')
  const isTXT = name.endsWith('.txt')

  // 加载摘要和提示词
  useEffect(() => {
    loadSummary()
    loadFilePrompt()
  }, [file.id])

  async function loadSummary() {
    try {
      const res = await fetch(`/api/summary?file_id=${file.id}`)
      if (res.ok) {
        const data = await res.json()
        setSummary(data?.content)
      }
    } catch (err) {
      console.error('Failed to load summary:', err)
    }
  }

  async function loadFilePrompt() {
    try {
      const res = await fetch(`/api/prompts/${file.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data?.prompt_text) {
          setPromptText(data.prompt_text)
        } else {
          setPromptText('')
        }
      }
    } catch (err) {
      console.error('Failed to load prompt:', err)
    }
  }

  async function generateSummary() {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: file.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummary(data.content)
      } else {
        const err = await res.json()
        alert(`Failed to generate summary: ${err.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  async function saveFilePrompt() {
    if (!promptText.trim()) {
      alert('Prompt text cannot be empty')
      return
    }
    setSavingPrompt(true)
    try {
      const res = await fetch(`/api/prompts/${file.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_text: promptText }),
      })
      if (res.ok) {
        setShowPromptSettings(false)
        alert('Prompt saved successfully!')
      } else {
        const err = await res.json()
        alert(`Failed to save prompt: ${err.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setSavingPrompt(false)
    }
  }

  async function deleteFilePrompt() {
    if (!confirm('Delete this custom prompt?')) return
    try {
      const res = await fetch(`/api/prompts/${file.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPromptText('')
        setShowPromptSettings(false)
        alert('Prompt deleted successfully!')
      } else {
        const err = await res.json()
        alert(`Failed to delete prompt: ${err.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }
  
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
  summaryContainer: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  summaryContent: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  promptSettingsContainer: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #eee',
    marginTop: '16px',
  },
  promptLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'block',
  },
  promptInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontFamily: 'inherit',
    marginBottom: '8px',
  },
  promptButtons: {
    display: 'flex',
    gap: '8px',
  },
  smallButton: {
    padding: '6px 12px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  smallButtonDanger: {
    padding: '6px 12px',
    backgroundColor: '#cc3333',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  loadingText: {
    color: '#666',
    fontSize: '12px',
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
        <button 
          onClick={() => setTab('summary')}
          style={{
            ...tabStyles.tabButton,
            ...(tab === 'summary' ? tabStyles.tabButtonActive : {})
          }}
        >
          ✨ Summary
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
        {tab === 'summary' && (
          <div style={tabStyles.summaryContainer}>
            <div style={{ marginBottom: '12px' }}>
              <button 
                onClick={generateSummary}
                disabled={summaryLoading}
                style={{
                  ...tabStyles.smallButton,
                  opacity: summaryLoading ? 0.6 : 1,
                  cursor: summaryLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {summaryLoading ? '⏳ Generating...' : '🤖 Generate Summary'}
              </button>
              <button 
                onClick={() => setShowPromptSettings(!showPromptSettings)}
                style={{
                  ...tabStyles.smallButton,
                  backgroundColor: showPromptSettings ? '#666' : '#0066cc',
                  marginLeft: '8px'
                }}
              >
                ⚙️ Settings
              </button>
            </div>

            {summary && (
              <div style={tabStyles.summaryContent}>
                <strong>Summary:</strong>
                <p style={{ margin: '8px 0 0 0' }}>{summary}</p>
              </div>
            )}

            {!summary && !summaryLoading && (
              <p style={tabStyles.loadingText}>No summary generated yet. Click "Generate Summary" to create one.</p>
            )}

            {showPromptSettings && (
              <div style={tabStyles.promptSettingsContainer}>
                <label style={tabStyles.promptLabel}>Custom Prompt for this file:</label>
                <textarea
                  style={{...tabStyles.promptInput, minHeight: '100px'}}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter custom prompt for AI summary generation..."
                />
                <div style={tabStyles.promptButtons}>
                  <button 
                    onClick={saveFilePrompt}
                    disabled={savingPrompt}
                    style={{
                      ...tabStyles.smallButton,
                      opacity: savingPrompt ? 0.6 : 1,
                      cursor: savingPrompt ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {savingPrompt ? '💾 Saving...' : '💾 Save Prompt'}
                  </button>
                  {promptText && (
                    <button 
                      onClick={deleteFilePrompt}
                      style={tabStyles.smallButtonDanger}
                    >
                      🗑️ Delete
                    </button>
                  )}
                  <button 
                    onClick={() => setShowPromptSettings(false)}
                    style={{
                      ...tabStyles.smallButton,
                      backgroundColor: '#999'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(md) {
  const mdlib = require('markdown-it')()
  return mdlib.render(md || '')
}
