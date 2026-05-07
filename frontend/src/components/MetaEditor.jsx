/**
 * Edits document-level metadata: title, subtitle, version, date, etc.
 */
export default function MetaEditor({ sop, onChange }) {
  const set = (key, val) => onChange({ ...sop, [key]: val })

  const field = (label, key, placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type="text"
        value={sop[key] || ''}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  )

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 16px',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Document Metadata
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {field('Title', 'title', 'Document title')}
        {field('Subtitle', 'subtitle', 'e.g. Integration Guide')}
        {field('Document Type', 'document_type', 'e.g. Standard Operating Procedure')}
        {field('Version', 'version', '1.0')}
        {field('Date', 'date', 'May 2026')}
        {field('Classification', 'classification', 'Internal Use Only')}
        {field('Authors', 'authors', 'Author names')}
        {field('Source Reference', 'source_reference', 'Optional — cite source document')}
      </div>
    </div>
  )
}
