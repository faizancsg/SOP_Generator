/**
 * Recursive section editor — handles sections, subsections, sub-subsections.
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import BlockEditor from './BlockEditor'

const newBlock = () => ({ type: 'paragraph', text: '' })
const newSubsection = (num) => ({
  number: num,
  title: 'New Subsection',
  content: [newBlock()],
  subsections: [],
})

function ContentList({ content, onChange }) {
  const update = (i, block) => {
    const n = [...content]; n[i] = block; onChange(n)
  }
  const remove = i => onChange(content.filter((_, j) => j !== i))
  const add = () => onChange([...content, newBlock()])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {content.map((block, i) => (
        <BlockEditor key={i} block={block} onChange={b => update(i, b)} onDelete={() => remove(i)} />
      ))}
      <button
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', fontSize: 12, padding: '5px 10px' }}
        onClick={add}
      >
        <Plus size={13} /> Add block
      </button>
    </div>
  )
}

function SubsectionEditor({ sub, sectionNum, subIdx, onChange, onDelete, depth = 1 }) {
  const [open, setOpen] = useState(true)
  const prefix = sectionNum ? `${sectionNum}.${subIdx + 1}` : `${subIdx + 1}`

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: depth === 1 ? 'rgba(26,107,181,0.08)' : 'var(--surface)',
        cursor: 'pointer',
      }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown size={14} color="var(--gray-400)" /> : <ChevronRight size={14} color="var(--gray-400)" />}
        <span style={{ color: 'var(--blue-light)', fontWeight: 600, fontSize: 12, minWidth: 28 }}>
          {prefix}
        </span>
        <input
          type="text"
          value={sub.title || ''}
          onChange={e => { e.stopPropagation(); onChange({ ...sub, title: e.target.value }) }}
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, fontWeight: 500 }}
          placeholder="Subsection title"
        />
        <button
          className="btn btn-danger"
          style={{ padding: '3px 7px' }}
          onClick={e => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ContentList
            content={sub.content || []}
            onChange={c => onChange({ ...sub, content: c })}
          />

          {/* Sub-subsections (depth 1 only) */}
          {depth < 2 && (
            <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(sub.subsections || []).map((ss, si) => (
                <SubsectionEditor
                  key={si}
                  sub={ss}
                  sectionNum={prefix}
                  subIdx={si}
                  depth={depth + 1}
                  onChange={updated => {
                    const n = [...(sub.subsections || [])]; n[si] = updated
                    onChange({ ...sub, subsections: n })
                  }}
                  onDelete={() => {
                    onChange({ ...sub, subsections: (sub.subsections || []).filter((_, j) => j !== si) })
                  }}
                />
              ))}
              <button
                className="btn btn-ghost"
                style={{ alignSelf: 'flex-start', fontSize: 11, padding: '4px 10px' }}
                onClick={() => onChange({
                  ...sub,
                  subsections: [...(sub.subsections || []), newSubsection(`${prefix}.${(sub.subsections || []).length + 1}`)]
                })}
              >
                <Plus size={12} /> Add sub-subsection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SectionEditor({ section, sectionIdx, onChange, onDelete }) {
  const [open, setOpen] = useState(true)
  const num = sectionIdx + 1

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 2,
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'var(--surface)',
        cursor: 'pointer',
        borderBottom: open ? '1px solid var(--border)' : 'none',
      }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown size={15} color="var(--blue-light)" /> : <ChevronRight size={15} color="var(--blue-light)" />}
        <span style={{
          background: 'var(--navy)',
          color: 'var(--blue-light)',
          fontWeight: 700,
          fontSize: 12,
          padding: '2px 8px',
          borderRadius: 4,
          minWidth: 24,
          textAlign: 'center',
        }}>
          {num}
        </span>
        <input
          type="text"
          value={section.title || ''}
          onChange={e => { e.stopPropagation(); onChange({ ...section, title: e.target.value, number: String(num) }) }}
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, fontWeight: 600, fontSize: 14 }}
          placeholder="Section title"
        />
        <button
          className="btn btn-danger"
          style={{ padding: '4px 8px' }}
          onClick={e => { e.stopPropagation(); onDelete() }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Section body */}
      {open && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Section-level content */}
          <ContentList
            content={section.content || []}
            onChange={c => onChange({ ...section, content: c })}
          />

          {/* Subsections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(section.subsections || []).map((sub, si) => (
              <SubsectionEditor
                key={si}
                sub={sub}
                sectionNum={String(num)}
                subIdx={si}
                depth={1}
                onChange={updated => {
                  const n = [...(section.subsections || [])]; n[si] = updated
                  onChange({ ...section, subsections: n })
                }}
                onDelete={() => onChange({
                  ...section,
                  subsections: (section.subsections || []).filter((_, j) => j !== si)
                })}
              />
            ))}
            <button
              className="btn btn-ghost"
              style={{ alignSelf: 'flex-start', fontSize: 12, padding: '5px 12px' }}
              onClick={() => onChange({
                ...section,
                subsections: [...(section.subsections || []), newSubsection(`${num}.${(section.subsections || []).length + 1}`)]
              })}
            >
              <Plus size={13} /> Add subsection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
