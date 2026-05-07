import { useState } from 'react'
import { Upload, FileText, Loader } from 'lucide-react'

export default function UploadZone({ onUpload, loading }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          width: '100%',
          maxWidth: 520,
          padding: '64px 40px',
          border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 16,
          background: dragging ? 'rgba(26,107,181,0.06)' : 'var(--surface)',
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
        }}
      >
        {loading ? (
          <>
            <Loader size={40} color="var(--blue)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--white)', fontWeight: 600, fontSize: 16 }}>
              Processing with Gemini AI…
            </p>
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>
              Extracting structure, steps, and requirements
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: 64, height: 64,
              background: 'var(--surface-2)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload size={28} color="var(--blue-light)" />
            </div>
            <div>
              <p style={{ color: 'var(--white)', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                Drop your document here
              </p>
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>
                PDF or DOCX — Gemini AI will extract and structure it into a professional SOP
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['.pdf', '.docx', '.doc'].map(ext => (
                <span key={ext} style={{
                  padding: '4px 10px',
                  background: 'var(--surface-2)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--gray-400)',
                  border: '1px solid var(--border)',
                }}>
                  {ext}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <span className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                <FileText size={14} /> Choose File
              </span>
              <span style={{ color: 'var(--gray-400)', fontSize: 12, alignSelf: 'center' }}>
                or drag & drop
              </span>
            </div>
          </>
        )}
        {!loading && (
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]) }}
          />
        )}
      </label>

      {/* Or start blank */}
      {!loading && (
        <div style={{ position: 'absolute', bottom: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>
            or use the <strong style={{ color: 'var(--white)' }}>New</strong> button in the header to start from scratch
          </p>
        </div>
      )}
    </div>
  )
}
