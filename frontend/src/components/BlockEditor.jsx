/**
 * Edit a single content block (paragraph, list, table, etc.)
 */
import { Trash2, GripVertical } from 'lucide-react'

const BLOCK_TYPES = [
  { value: 'paragraph',     label: 'Paragraph' },
  { value: 'bullet_list',   label: 'Bullet List' },
  { value: 'numbered_list', label: 'Numbered List' },
  { value: 'table',         label: 'Table' },
  { value: 'info_box',      label: 'Info Box' },
  { value: 'note',          label: 'Note' },
]

function ParagraphBlock({ block, onChange }) {
  return (
    <textarea
      value={block.text || ''}
      placeholder="Enter paragraph text… Use **bold** and *italic*"
      rows={3}
      onChange={e => onChange({ ...block, text: e.target.value })}
      style={{ width: '100%', resize: 'vertical', fontSize: 13 }}
    />
  )
}

function ListBlock({ block, onChange, type }) {
  const items = block.items || []
  const update = newItems => onChange({ ...block, items: newItems })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: 'var(--gray-400)', fontSize: 12, minWidth: 18, textAlign: 'right' }}>
            {type === 'numbered_list' ? `${i + 1}.` : '•'}
          </span>
          <input
            type="text"
            value={typeof item === 'string' ? item : item.text || ''}
            placeholder={`Item ${i + 1}`}
            onChange={e => {
              const n = [...items]
              n[i] = e.target.value
              update(n)
            }}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-danger"
            style={{ padding: '4px 8px' }}
            onClick={() => update(items.filter((_, j) => j !== i))}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', marginTop: 2, padding: '5px 10px', fontSize: 12 }}
        onClick={() => update([...items, ''])}
      >
        + Add item
      </button>
    </div>
  )
}

function TableBlock({ block, onChange }) {
  const headers = block.headers || ['Column 1', 'Column 2']
  const rows = block.rows || [['', '']]

  const setHeaders = h => onChange({ ...block, headers: h })
  const setRows = r => onChange({ ...block, rows: r })

  const addCol = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`])
    setRows(rows.map(r => [...r, '']))
  }
  const addRow = () => setRows([...rows, headers.map(() => '')])
  const removeRow = i => setRows(rows.filter((_, j) => j !== i))

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: 12 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: 4 }}>
                <input
                  type="text"
                  value={h}
                  onChange={e => {
                    const n = [...headers]; n[i] = e.target.value; setHeaders(n)
                  }}
                  style={{ width: '100%', fontWeight: 600 }}
                  placeholder={`Header ${i + 1}`}
                />
              </th>
            ))}
            <th>
              <button className="btn btn-ghost" style={{ padding: '3px 7px', fontSize: 11 }} onClick={addCol}>
                + Col
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => (
                <td key={ci} style={{ padding: 4 }}>
                  <input
                    type="text"
                    value={row[ci] || ''}
                    onChange={e => {
                      const n = rows.map((r, rj) => rj === ri ? r.map((c, cj) => cj === ci ? e.target.value : c) : r)
                      setRows(n)
                    }}
                    style={{ width: '100%' }}
                  />
                </td>
              ))}
              <td style={{ padding: 4 }}>
                <button className="btn btn-danger" style={{ padding: '3px 7px' }} onClick={() => removeRow(ri)}>
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-ghost" style={{ marginTop: 6, fontSize: 12, padding: '4px 10px' }} onClick={addRow}>
        + Add row
      </button>
    </div>
  )
}

function InfoBlock({ block, onChange, label }) {
  return (
    <textarea
      value={block.text || ''}
      placeholder={`${label} text…`}
      rows={2}
      onChange={e => onChange({ ...block, text: e.target.value })}
      style={{ width: '100%', resize: 'vertical', fontSize: 13 }}
    />
  )
}

export default function BlockEditor({ block, onChange, onDelete }) {
  const type = block.type || 'paragraph'

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Type selector + delete */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <GripVertical size={14} color="var(--gray-400)" style={{ flexShrink: 0 }} />
        <select
          value={type}
          onChange={e => onChange({ ...block, type: e.target.value, text: '', items: [], headers: [], rows: [] })}
          style={{ flex: 1, fontSize: 12 }}
        >
          {BLOCK_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={onDelete}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Block content */}
      {(type === 'paragraph') && <ParagraphBlock block={block} onChange={onChange} />}
      {(type === 'bullet_list') && <ListBlock block={block} onChange={onChange} type="bullet_list" />}
      {(type === 'numbered_list') && <ListBlock block={block} onChange={onChange} type="numbered_list" />}
      {(type === 'table') && <TableBlock block={block} onChange={onChange} />}
      {(type === 'info_box') && <InfoBlock block={block} onChange={onChange} label="Info Box" />}
      {(type === 'note') && <InfoBlock block={block} onChange={onChange} label="Note" />}
    </div>
  )
}
