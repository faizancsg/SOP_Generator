import { useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import EditorPanel from './components/EditorPanel'
import Preview from './components/Preview'
import ChatPanel from './components/ChatPanel'

const THEMES = ['minimalist', 'technical', 'executive']

export default function App() {
  const [sop, setSop] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [theme, setTheme] = useState('minimalist')
  const [error, setError] = useState('')

  const handleUpload = async file => {
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await axios.post('/api/upload', form)
      setSop(data.sop)
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed. Make sure GEMINI_API_KEY is set in the backend.')
    } finally {
      setUploading(false)
    }
  }

  const handleNew = async () => {
    setError('')
    try {
      const { data } = await axios.post('/api/new', { title: 'New SOP' })
      setSop(data.sop)
      setChatOpen(false)
    } catch {
      setSop({
        title: 'New SOP', subtitle: '', document_type: 'Standard Operating Procedure',
        version: '1.0', date: new Date().getFullYear().toString(),
        classification: 'Internal Use Only', authors: '', source_reference: '',
        sections: [{
          number: '1', title: 'Overview',
          content: [{ type: 'paragraph', text: 'Describe the purpose here.' }],
          subsections: [],
        }],
      })
    }
  }

  const handleExport = async () => {
    if (!sop) return
    setExporting(true)
    setError('')
    try {
      const res = await axios.post('/api/export/docx', { sop }, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(sop.title || 'SOP').replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Export failed. Make sure the backend is running on port 8000.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Header
        title={sop?.title}
        hasDoc={!!sop}
        chatOpen={chatOpen}
        exporting={exporting}
        onNew={handleNew}
        onUpload={handleUpload}
        onExport={handleExport}
        onToggleChat={() => setChatOpen(o => !o)}
      />

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.3)',
          padding: '8px 20px', fontSize: 13, color: '#FCA5A5',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {!sop && !uploading ? (
          <UploadZone onUpload={handleUpload} loading={false} />
        ) : uploading ? (
          <UploadZone onUpload={handleUpload} loading={true} />
        ) : (
          <>
            {/* Theme switcher */}
            <div style={{
              position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, display: 'flex', gap: 2, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 8, padding: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {THEMES.map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '4px 12px', borderRadius: 5, border: 'none',
                    background: theme === t ? 'var(--navy)' : 'transparent',
                    color: theme === t ? 'var(--white)' : 'var(--gray-400)',
                    fontSize: 11, fontWeight: theme === t ? 600 : 400,
                    cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {t === 'minimalist' ? 'Minimalist' : t === 'technical' ? 'Technical Grid' : 'Executive'}
                </button>
              ))}
            </div>

            <EditorPanel sop={sop} onChange={setSop} />
            <Preview sop={sop} theme={theme} />
            {chatOpen && <ChatPanel sop={sop} onSOPUpdate={setSop} />}
          </>
        )}
      </div>
    </>
  )
}
