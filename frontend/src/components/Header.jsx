import { FileText, Download, Plus, Upload, MessageSquare } from 'lucide-react'

export default function Header({
  onNew, onUpload, onExport, onToggleChat,
  chatOpen, exporting, hasDoc, title,
}) {
  return (
    <header style={{
      background: 'var(--navy)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      gap: 12,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileText size={20} color="var(--blue-light)" />
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
          SOP Generator
        </span>
        {title && (
          <span style={{
            color: 'var(--gray-400)', fontSize: 13, marginLeft: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 280,
          }}>
            / {title}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button className="btn btn-ghost" onClick={onNew} title="New blank SOP">
          <Plus size={15} /> New
        </button>

        <label className="btn btn-ghost" style={{ cursor: 'pointer' }} title="Upload PDF or DOCX">
          <Upload size={15} /> Upload Document
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = ''; }}
          />
        </label>

        {hasDoc && (
          <button
            className="btn btn-ghost"
            onClick={onToggleChat}
            style={chatOpen ? { borderColor: 'var(--blue)', color: 'var(--blue-light)' } : {}}
            title="Toggle AI chat panel"
          >
            <MessageSquare size={15} /> AI Chat
          </button>
        )}

        <button
          className="btn btn-success"
          onClick={onExport}
          disabled={!hasDoc || exporting}
          title="Export to Microsoft Word"
        >
          {exporting ? <span className="spinner" /> : <Download size={15} />}
          {exporting ? 'Generating…' : 'Export to Word'}
        </button>
      </div>
    </header>
  )
}
