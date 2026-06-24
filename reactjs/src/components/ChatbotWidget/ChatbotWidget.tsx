import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getStatus as getChatbotStatus,
  postChat,
  postUploadJson,
  postUploadText,
} from '../../services/chatbotService';
import { RootState } from '../../store/reducers/rootReducer';
import { USER_ROLE } from '../../utils/constant';
import './ChatbotWidget.scss';

interface ChatMessage {
  id: string;
  author: 'user' | 'assistant';
  text: string;
}

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'upload'>('chat');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vectorStoreSize, setVectorStoreSize] = useState<number | null>(null);
  const [statusError, setStatusError] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [uploadMode, setUploadMode] = useState<'text' | 'json'>('text');
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState('');

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('openChatbot', handleOpen as EventListener);
    return () =>
      window.removeEventListener('openChatbot', handleOpen as EventListener);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!isAdmin && tab === 'upload') {
      setTab('chat');
    }

    const loadStatus = async () => {
      setStatusError('');
      try {
        const status = await getChatbotStatus();
        if (status.error) {
          setStatusError(status.error);
          setVectorStoreSize(null);
        } else {
          setVectorStoreSize(status.vectorStoreSize ?? 0);
        }
      } catch (err) {
        setStatusError('Không thể kết nối tới backend.');
        setVectorStoreSize(null);
      }
    };

    void loadStatus();
  }, [open, isAdmin, tab]);

  const refreshStatus = useCallback(async () => {
    setStatusError('');
    try {
      const status = await getChatbotStatus();
      if (status.error) {
        setStatusError(status.error);
        setVectorStoreSize(null);
      } else {
        setVectorStoreSize(status.vectorStoreSize ?? 0);
      }
    } catch (err) {
      setStatusError('Không thể kết nối tới backend.');
      setVectorStoreSize(null);
    }
  }, []);

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

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const response = await postChat(trimmed);
      if (response.error) {
        setError(response.error);
      } else {
        const answer =
          response.answer || response.message || 'Không có câu trả lời.';
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          author: 'assistant',
          text: answer,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setError('Lỗi kết nối backend. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [question]);

  const handleUpload = useCallback(async () => {
    const trimmed = uploadText.trim();
    if (!trimmed) {
      setUploadFeedback('Vui lòng nhập nội dung trước khi upload.');
      return;
    }

    setUploading(true);
    setUploadFeedback('');

    try {
      const response =
        uploadMode === 'json'
          ? await postUploadJson(trimmed)
          : await postUploadText(trimmed, 'widget');

      if (response.error) {
        setUploadFeedback(`Lỗi: ${response.error}`);
      } else {
        setUploadFeedback(
          `Upload thành công. Đã thêm ${response.added ?? 0} mục.`
        );
        setUploadText('');
        await refreshStatus();
      }
    } catch (err) {
      setUploadFeedback('Không thể kết nối backend để upload dữ liệu.');
    } finally {
      setUploading(false);
    }
  }, [refreshStatus, uploadMode, uploadText]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      void handleSend();
    },
    [handleSend]
  );

  const handleToggle = useCallback(() => {
    setOpen((current) => !current);
    setError('');
    setUploadFeedback('');
  }, []);

  const hasMessages = messages.length > 0;
  const bottomText = useMemo(
    () =>
      hasMessages ? 'Nhập tin nhắn của bạn...' : 'Nhập câu hỏi để bắt đầu',
    [hasMessages]
  );

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-modal" role="dialog" aria-modal="true">
          <div className="chatbot-header">
            <div>
              <strong>Chatbot hỗ trợ</strong>
              <div className="chatbot-subtitle">
                {isAdmin
                  ? 'Dữ liệu RAG được upload để trả lời thông minh.'
                  : 'Bạn có thể chat và nhận câu trả lời ngay.'}
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close"
              onClick={handleToggle}
            >
              ×
            </button>
          </div>

          <div className="chatbot-tabs">
            <button
              type="button"
              className={tab === 'chat' ? 'active' : ''}
              onClick={() => setTab('chat')}
            >
              Chat
            </button>
            {isAdmin && (
              <button
                type="button"
                className={tab === 'upload' ? 'active' : ''}
                onClick={() => setTab('upload')}
              >
                Upload dữ liệu
              </button>
            )}
          </div>

          {isAdmin && (
            <>
              <div className="chatbot-status">
                {statusError ? (
                  <span className="status-error">{statusError}</span>
                ) : vectorStoreSize === null ? (
                  <span>Đang kiểm tra trạng thái backend...</span>
                ) : (
                  <span>Đã upload dữ liệu: {vectorStoreSize} chunk(s)</span>
                )}
                <button
                  type="button"
                  onClick={refreshStatus}
                  className="status-refresh"
                >
                  Làm mới
                </button>
              </div>
              <div className="chatbot-info">
                Chức năng upload chỉ có ở admin. Bạn vẫn có thể chat và nhận câu
                trả lời từ dữ liệu admin đã nạp.
              </div>
            </>
          )}

          {tab === 'chat' ? (
            <>
              <div className="chatbot-body">
                {vectorStoreSize === 0 && (
                  <div className="chatbot-warning">
                    Chưa có dữ liệu RAG. Hãy chuyển qua tab Upload để thêm nội
                    dung.
                  </div>
                )}
                {hasMessages ? (
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
                ) : (
                  <div className="chatbot-empty">
                    Xin chào! Hãy đặt câu hỏi bằng cách gõ phía dưới.
                  </div>
                )}
              </div>
              <form className="chatbot-input" onSubmit={handleSubmit}>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={bottomText}
                  rows={3}
                />
                <div className="chatbot-form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
                {error && <div className="chatbot-error">{error}</div>}
              </form>
            </>
          ) : (
            <div className="chatbot-upload-panel">
              <div className="chatbot-upload-mode">
                <label>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="text"
                    checked={uploadMode === 'text'}
                    onChange={() => setUploadMode('text')}
                  />
                  Văn bản thường
                </label>
                <label>
                  <input
                    type="radio"
                    name="uploadMode"
                    value="json"
                    checked={uploadMode === 'json'}
                    onChange={() => setUploadMode('json')}
                  />
                  JSON
                </label>
              </div>
              <textarea
                value={uploadText}
                onChange={(event) => setUploadText(event.target.value)}
                placeholder="Dán văn bản hoặc JSON vào đây, sau đó bấm upload"
                rows={8}
              />
              <div className="chatbot-upload-actions">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Đang upload...' : 'Upload dữ liệu'}
                </button>
              </div>
              {uploadFeedback && (
                <div className="chatbot-upload-feedback">{uploadFeedback}</div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        className="chatbot-fab"
        type="button"
        onClick={handleToggle}
        aria-label="Mở chatbot"
      >
        <span className="chatbot-fab-icon">💬</span>
      </button>
    </div>
  );
};

export default ChatbotWidget;
