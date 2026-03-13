import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

export default function ChatAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am the RiskRadar AI assistant. How can I help you stay safe today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm a simple interface right now, but soon I'll be connected to the RiskRadar engine to answer your questions!"
      }]);
    }, 1000);
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-title">
          <Bot size={16} color="var(--accent-light)" />
          <span>RiskRadar Assistant</span>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message-row ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about cybersecurity..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
