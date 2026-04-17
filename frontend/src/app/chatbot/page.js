import { useState } from 'react';
import styles from './page.module.css';

export default function Chatbot({userName}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: `Chào ${userName}! Mộc có thể giúp gì cho bạn hôm nay?`, isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { id: Date.now(), text: input, isBot: false }]);
    setInput('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Mộc đang tìm cuốn đó trên kệ, Thương đợi xíu nhé...", 
        isBot: true 
      }]);
    }, 1000);
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen ? (
        <button className={styles.chatTrigger} onClick={() => setIsOpen(true)}>
        </button>
      ) : (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <div className={styles.botAvatar}></div>
              <span style={{ fontWeight: 600 }}>Thủ thư Mộc</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>

          <div className={styles.chatBody}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${msg.isBot ? styles.botMessage : styles.userMessage}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className={styles.chatInputArea}>
            <input 
              className={styles.inputField}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi Mộc..."
            />
            <button className={styles.sendBtn} onClick={handleSend}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}