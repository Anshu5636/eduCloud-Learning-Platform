// src/components/common/AIChatbot.jsx — Gemini powered
import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import { Send, Bot, X, Minimize2, Maximize2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIChatbot() {
  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m **EduBot**, powered by Gemini AI.\n\nAsk me anything about your courses, programming concepts, algorithms, or any academic topic!',
    }
  ]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [aiAvailable, setAiAvailable] = useState(null); // null=unknown, true/false
  const bottomRef = useRef(null);

  // Check AI status on mount
  useEffect(() => {
    aiAPI.status()
      .then(r => setAiAvailable(r.data.aiAvailable))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg  = { role: 'user', content: input };
    const history  = messages.slice(1); // exclude the welcome message
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiAPI.chat({ message: input, history });
      const { reply, aiAvailable: av } = res.data;
      setAiAvailable(av);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not reach the AI service. Please check your GEMINI_API_KEY in backend .env and restart the server.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickPrompts = [
    'Explain OOP concepts',
    'What is Big O notation?',
    'How does React useState work?',
    'Explain recursion with example',
  ];

  // Status indicator
  const StatusBadge = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem' }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: aiAvailable === true ? '#34d399' : aiAvailable === false ? '#fbbf24' : '#64748b',
        animation: aiAvailable === true ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ color: aiAvailable === true ? '#34d399' : aiAvailable === false ? '#fbbf24' : '#64748b' }}>
        {aiAvailable === true ? 'Gemini Connected' : aiAvailable === false ? 'Demo Mode' : 'Checking...'}
      </span>
    </div>
  );

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            border: 'none', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(99,102,241,0.5)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          <Bot size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          width: 370, background: '#1e293b',
          border: '1px solid #334155', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          height: minimized ? 'auto' : 520,
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: minimized ? 'none' : '1px solid #334155',
            background: 'linear-gradient(135deg, #0f1f3d, #1e293b)',
            borderRadius: minimized ? '20px' : '20px 20px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '12px',
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  EduBot
                  <Zap size={13} color="#fbbf24" />
                </div>
                <StatusBadge />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setMinimized(!minimized)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                {minimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                        background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot size={14} color="#fff" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '82%', padding: '0.65rem 0.9rem',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #38bdf8, #6366f1)'
                        : '#0f172a',
                      color: '#f1f5f9', fontSize: '0.83rem', lineHeight: 1.6,
                      border: msg.role === 'assistant' ? '1px solid #1e293b' : 'none',
                    }}>
                      <ReactMarkdown components={{
                        p: ({children}) => <p style={{ margin: '0 0 0.4rem 0' }}>{children}</p>,
                        strong: ({children}) => <strong style={{ color: '#38bdf8' }}>{children}</strong>,
                        code: ({children}) => <code style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', fontSize: '0.78rem', fontFamily: 'monospace', color: '#34d399' }}>{children}</code>,
                        ul: ({children}) => <ul style={{ paddingLeft: '1rem', margin: '0.3rem 0' }}>{children}</ul>,
                        li: ({children}) => <li style={{ marginBottom: '2px' }}>{children}</li>,
                      }}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={14} color="#fff" />
                    </div>
                    <div style={{ background: '#0f172a', padding: '0.65rem 1rem', borderRadius: '16px 16px 16px 4px', border: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 6, height: 6, borderRadius: '50%', background: '#38bdf8',
                            animation: `pulse 1.2s ${i * 0.2}s infinite`,
                          }} />
                        ))}
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>
                          Gemini thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts — only show at start */}
              {messages.length <= 2 && (
                <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quickPrompts.map(p => (
                    <button key={p} onClick={() => setInput(p)} style={{
                      background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
                      color: '#38bdf8', borderRadius: '999px', padding: '3px 10px',
                      fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Gemini badge */}
              <div style={{ padding: '0 1rem 0.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#334155' }}>
                  ✨ Powered by Google Gemini
                </span>
              </div>

              {/* Input */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask any academic question..."
                  rows={1}
                  style={{
                    flex: 1, resize: 'none', background: '#0f172a',
                    border: '1px solid #334155', borderRadius: '10px',
                    color: '#f1f5f9', padding: '0.6rem 0.8rem',
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.85rem',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#38bdf8'}
                  onBlur={e => e.target.style.borderColor = '#334155'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 38, height: 38, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                    border: 'none', cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: !input.trim() || loading ? 0.5 : 1, alignSelf: 'flex-end',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
