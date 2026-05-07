import { Plus } from 'lucide-react'
import MetaEditor from './MetaEditor'
import SectionEditor from './SectionEditor'

const newSection = (num) => ({
  number: String(num),
  title: 'New Section',
  content: [{ type: 'paragraph', text: '' }],
  subsections: [],
})

export default function EditorPanel({ sop, onChange }) {
  if (!sop) return null

  const setSections = sections => onChange({ ...sop, sections })

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: '1px solid var(--border)',
    }}>
      {/* Meta editor */}
      <MetaEditor sop={sop} onChange={onChange} />

      {/* Sections */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Sections
          </p>
          <button
            className="btn btn-primary"
            style={{ padding: '5px 12px', fontSize: 12 }}
            onClick={() => setSections([...(sop.sections || []), newSection((sop.sections || []).length + 1)])}
          >
            <Plus size={13} /> Add section
          </button>
        </div>

        {(sop.sections || []).map((section, i) => (
          <SectionEditor
            key={i}
            section={section}
            sectionIdx={i}
            onChange={updated => {
              const n = [...sop.sections]; n[i] = updated; setSections(n)
            }}
            onDelete={() => setSections(sop.sections.filter((_, j) => j !== i))}
          />
        ))}

        {(sop.sections || []).length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'var(--gray-400)', fontSize: 13,
          }}>
            No sections yet. Click "Add section" to get started.
          </div>
        )}
      </div>
    </div>
  )
}
