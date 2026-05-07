import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle } from 'lucide-react'
import axios from 'axios'

export default function ChatPanel({ sop, onSOPUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can refine your SOP. Try:\n• "Make section 2 more detailed"\n• "Add a troubleshooting section"\n• "Convert step 3 to a numbered list"\n• "Add a prerequisites table"',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return

    setInput('')
    setError('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const res = await axios.post('/api/chat', {
        sop,
        message: msg,
        history,
      })
      const { sop: updatedSop, reply } = res.data
      onSOPUpdate(updatedSop)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      const errMsg = e.response?.data?.detail || 'Request failed. Check your GEMINI_API_KEY.'
      setError(errMsg)
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errMsg}`, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: 320,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Bot size={16} color="var(--blue-light)" />
        <span style={{ fontWeight: 600, fontSize: 13 }}>AI Chat Editor</span>
        <span style={{
          marginLeft: 'auto', fontSize: 10, padding: '2px 7px',
          background: 'rgba(16,185,129,0.15)', color: 'var(--emerald)',
          borderRadius: 99, fontWeight: 600,
        }}>
          Gemini
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 8px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: msg.role === 'user' ? 'var(--blue)' : 'var(--navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.role === 'user'
                  ? <User size={13} color="#fff" />
                  : <Bot size={13} color="var(--blue-light)" />
                }
              </div>
              <div style={{
                maxWidth: '78%',
                background: msg.role === 'user'
                  ? 'var(--blue)'
                  : msg.isError ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)',
                border: msg.isError ? '1px solid rgba(239,68,68,0.3)' : 'none',
                borderRadius: msg.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                padding: '8px 11px',
                fontSize: 12.5,
                lineHeight: 1.55,
                color: msg.role === 'user' ? '#fff' : msg.isError ? 'var(--red)' : 'var(--white)',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 8px' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--navy)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={13} color="var(--blue-light)" />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--blue)',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask to refine, add, or change…"
          rows={2}
          disabled={loading}
          style={{ flex: 1, resize: 'none', fontSize: 12.5, lineHeight: 1.4 }}
        />
        <button
          className="btn btn-primary"
          style={{ alignSelf: 'flex-end', padding: '7px 10px' }}
          onClick={send}
          disabled={!input.trim() || loading}
        >
          <Send size={14} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
