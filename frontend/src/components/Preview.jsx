/**
 * Live preview — renders the SOP JSON in the Varonis template style.
 * Colors: H1=#0F2B46, H2=#1A6BB5, H3=#0F2B46, cover bg=#0F2B46
 */
import { useState } from 'react'

// ── Inline markdown renderer (bold, italic, code) ────────────────────────────
function InlineMarkdown({ text = '' }) {
  const parts = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0, m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>)
    if (m[0].startsWith('**'))
      parts.push(<strong key={m.index}>{m[2]}</strong>)
    else if (m[0].startsWith('*'))
      parts.push(<em key={m.index}>{m[3]}</em>)
    else
      parts.push(<code key={m.index} style={{ fontFamily: 'monospace', background: '#f0f4f8', padding: '1px 4px', borderRadius: 3, fontSize: '0.9em' }}>{m[4]}</code>)
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>)
  return <>{parts}</>
}

// ── Block renderers ──────────────────────────────────────────────────────────
function renderBlock(block, idx, checkable, checked, onCheck) {
  const key = idx

  if (block.type === 'paragraph') {
    return (
      <p key={key} style={{ margin: '0 0 10px', lineHeight: 1.7, color: '#1A1A1A', fontSize: 10.5 }}>
        <InlineMarkdown text={block.text} />
      </p>
    )
  }

  if (block.type === 'bullet_list' || block.type === 'numbered_list') {
    const items = block.items || []
    const Tag = block.type === 'numbered_list' ? 'ol' : 'ul'
    return (
      <Tag key={key} style={{ margin: '0 0 10px 20px', lineHeight: 1.7, color: '#1A1A1A', fontSize: 10.5 }}>
        {items.map((item, i) => {
          const text = typeof item === 'string' ? item : item.text || ''
          const checkKey = `${key}-${i}`
          const isChecked = checked[checkKey]
          return (
            <li key={i} style={{
              marginBottom: 3,
              textDecoration: checkable && isChecked ? 'line-through' : 'none',
              color: checkable && isChecked ? '#94A3B8' : '#1A1A1A',
              display: 'flex', gap: 6, alignItems: 'flex-start',
              listStyle: checkable ? 'none' : undefined,
              marginLeft: checkable ? -16 : 0,
            }}>
              {checkable && (
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => onCheck(checkKey)}
                  style={{ marginTop: 4, accentColor: '#10B981', cursor: 'pointer', flexShrink: 0 }}
                />
              )}
              <span><InlineMarkdown text={text} /></span>
            </li>
          )
        })}
      </Tag>
    )
  }

  if (block.type === 'table') {
    const headers = block.headers || []
    const rows = block.rows || []
    return (
      <div key={key} style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 10, border: '1px solid #CBD5E1' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  background: '#0F2B46', color: '#fff',
                  padding: '7px 10px', textAlign: 'left',
                  fontWeight: 600, fontSize: 10, border: '1px solid #1A3A55',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#F0F4F8' : '#fff' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '6px 10px', border: '1px solid #CBD5E1',
                    color: '#1A1A1A', fontSize: 10, verticalAlign: 'top',
                  }}>
                    <InlineMarkdown text={String(cell)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (block.type === 'info_box') {
    return (
      <div key={key} style={{
        background: '#E9F1F9', border: '1px solid #BFDBFE',
        borderRadius: 6, padding: '10px 14px', marginBottom: 10,
        color: '#1A1A1A', fontSize: 10, lineHeight: 1.6,
        borderLeft: '3px solid #1A6BB5',
      }}>
        <InlineMarkdown text={block.text} />
      </div>
    )
  }

  if (block.type === 'note') {
    return (
      <div key={key} style={{
        background: '#FFF7ED', border: '1px solid #FED7AA',
        borderRadius: 6, padding: '10px 14px', marginBottom: 10,
        color: '#1A1A1A', fontSize: 10, lineHeight: 1.6,
        borderLeft: '3px solid #F59E0B',
      }}>
        <strong>NOTE:</strong> <InlineMarkdown text={block.text} />
      </div>
    )
  }

  return null
}

function renderContentBlocks(blocks, checkable, checked, onCheck) {
  return (blocks || []).map((b, i) => renderBlock(b, i, checkable, checked, onCheck))
}

// ── Preview component ────────────────────────────────────────────────────────
export default function Preview({ sop, theme }) {
  const [checkable, setCheckable] = useState(false)
  const [checked, setChecked] = useState({})
  const onCheck = key => setChecked(c => ({ ...c, [key]: !c[key] }))

  if (!sop) return null

  const fonts = {
    minimalist: "'Inter', sans-serif",
    technical:  "'Inter', sans-serif",
    executive:  "'Georgia', 'Times New Roman', serif",
  }
  const fontFamily = fonts[theme] || fonts.minimalist

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
      {/* Preview toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Live Preview
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--gray-400)' }}>
          <input
            type="checkbox"
            checked={checkable}
            onChange={e => setCheckable(e.target.checked)}
            style={{ accentColor: 'var(--emerald)' }}
          />
          Interactive checklists
        </label>
      </div>

      {/* Document */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', background: '#F1F5F9' }}>
        <div style={{
          maxWidth: 780,
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 1px 20px rgba(0,0,0,0.12)',
          borderRadius: theme === 'minimalist' ? 0 : 8,
          overflow: 'hidden',
          fontFamily,
        }}>
          {/* Cover page */}
          <div style={{
            background: '#0F2B46',
            padding: theme === 'executive' ? '60px 48px' : '52px 44px',
          }}>
            <p style={{
              color: '#1A6BB5', fontWeight: 700, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16,
            }}>
              {sop.document_type || 'Standard Operating Procedure'}
            </p>
            <h1 style={{
              color: '#fff', fontWeight: 700,
              fontSize: theme === 'executive' ? 30 : 26,
              lineHeight: 1.2, margin: '0 0 12px',
              letterSpacing: '-0.5px',
            }}>
              {sop.title || 'Untitled SOP'}
            </h1>
            {sop.subtitle && (
              <p style={{ color: '#B0C4DE', fontSize: 14, margin: '0 0 32px', lineHeight: 1.5 }}>
                {sop.subtitle}
              </p>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
              <p style={{ color: '#9AAAB8', fontSize: 10, letterSpacing: '0.03em' }}>
                {[
                  sop.version && `Version ${sop.version}`,
                  sop.date,
                  sop.classification,
                ].filter(Boolean).join('  ·  ')}
              </p>
              {sop.authors && (
                <p style={{ color: '#9AAAB8', fontSize: 10, marginTop: 4 }}>
                  Prepared by: {sop.authors}
                </p>
              )}
            </div>
          </div>

          {/* Source reference box */}
          {sop.source_reference && (
            <div style={{
              background: '#E9F1F9',
              padding: '12px 44px',
              borderBottom: '1px solid #BFDBFE',
              fontSize: 10, color: '#0F2B46', lineHeight: 1.6,
            }}>
              <strong>SOURCE REFERENCE</strong><br />
              {sop.source_reference}
            </div>
          )}

          {/* Body */}
          <div style={{ padding: theme === 'technical' ? '36px 44px' : '40px 44px' }}>
            {(sop.sections || []).map((section, si) => (
              <div key={si} style={{ marginBottom: 32 }}>
                {/* H1 */}
                <h2 style={{
                  color: '#0F2B46',
                  fontSize: theme === 'executive' ? 17 : 16,
                  fontWeight: 700,
                  margin: '0 0 8px',
                  paddingBottom: 8,
                  borderBottom: theme === 'technical' ? '2px solid #0F2B46' : '1px solid #CBD5E1',
                  letterSpacing: theme === 'executive' ? '0.02em' : 0,
                }}>
                  {section.number}  {section.title}
                </h2>

                {renderContentBlocks(section.content, checkable, checked, onCheck)}

                {/* Subsections */}
                {(section.subsections || []).map((sub, subI) => (
                  <div key={subI} style={{ marginBottom: 20 }}>
                    <h3 style={{
                      color: '#1A6BB5',
                      fontSize: 13,
                      fontWeight: 600,
                      margin: '16px 0 6px',
                    }}>
                      {sub.number}  {sub.title}
                    </h3>

                    {renderContentBlocks(sub.content, checkable, checked, onCheck)}

                    {/* Sub-subsections */}
                    {(sub.subsections || []).map((ss, ssI) => (
                      <div key={ssI} style={{ marginBottom: 12, paddingLeft: theme === 'technical' ? 16 : 0 }}>
                        <h4 style={{
                          color: '#0F2B46',
                          fontSize: 11,
                          fontWeight: 600,
                          margin: '12px 0 5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          {ss.number}  {ss.title}
                        </h4>
                        {renderContentBlocks(ss.content, checkable, checked, onCheck)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            padding: '12px 44px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#F8FAFC',
          }}>
            <span style={{ color: '#94A3B8', fontSize: 9 }}>
              {sop.title} {sop.version && `v${sop.version}`}
            </span>
            <span style={{ color: '#94A3B8', fontSize: 9 }}>
              {sop.classification || 'Internal Use Only'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
