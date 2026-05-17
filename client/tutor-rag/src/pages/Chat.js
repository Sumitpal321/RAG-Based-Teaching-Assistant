import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { sendChat } from '../services/api';
import { Send, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! 👋 I'm your AI tutor. Ask me anything about your study materials!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { getAuthHeader } = useAuth();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const query = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const res = await sendChat(query, getAuthHeader());
      const { answer, sources } = res.data;
      setMessages(prev => [...prev, {
        role: 'bot',
        text: answer,
        sources: sources?.length ? sources : null
      }]);
    } catch {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Try again! 😅" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="chat-page">
        <div className="chat-header">
          <h2>🤖 AI Tutor Chat</h2>
          <p>Ask questions about your study materials</p>
        </div>
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'bot' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.sources && (
                  <div className="sources">
                    <span>📚 Sources: </span>
                    {msg.sources.map((s, j) => <span key={j} className="source-tag">{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-avatar"><Bot size={20} /></div>
              <div className="message-content typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input" onSubmit={handleSend}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your study materials... 💭"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
