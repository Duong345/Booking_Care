import { useCallback, useState } from 'react';
import { postChat } from '../../services/chatbotService';
import './Chatbot.scss';

interface ChatMessage {
  id: string;
  author: 'user' | 'assistant';
  text: string;
}

const Chatbot = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      author: 'user',
      text: trimmed,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const response = await postChat(trimmed);
      const answer =
        response?.answer || response?.message || 'Không có câu trả lời.';
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        author: 'assistant',
        text: answer,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err) {
      setError('Lỗi kết nối backend. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [question]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      void handleSend();
    },
    [handleSend]
  );

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <h2>Chatbot hỗ trợ</h2>
        <p>Nhập câu hỏi và hệ thống sẽ trả lời từ backend RAG.</p>
      </div>

      <div className="chatbot-panel">
        <div className="chatbot-messages">
          {messages.length === 0 ? (
            <div className="chatbot-empty">
              Chưa có cuộc trò chuyện nào. Hãy nhập câu hỏi để bắt đầu.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.author === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="chatbot-message-role">
                  {message.author === 'user' ? 'Bạn' : 'Chatbot'}
                </div>
                <div className="chatbot-message-text">{message.text}</div>
              </div>
            ))
          )}
        </div>

        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Nhập câu hỏi của bạn ở đây..."
            rows={3}
          />
          <div className="chatbot-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi câu hỏi'}
            </button>
          </div>
          {error && <div className="chatbot-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
