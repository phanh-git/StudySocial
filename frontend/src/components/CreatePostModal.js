import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CreatePostModal.css';

const POST_TYPES = [
  { value: 'DISCUSSION', label: '💬 Thảo luận' },
  { value: 'QUESTION', label: '❓ Câu hỏi' },
  { value: 'SHARE', label: '📎 Chia sẻ' },
];

const CreatePostModal = ({ onClose, onCreated, groupId }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('DISCUSSION');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/subjects').then(res => setSubjects(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        content,
        type,
        subjectId: subjectId ? Number(subjectId) : null,
        groupId: groupId || null,
      };
      const res = await api.post('/api/posts', payload);
      onCreated && onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>✍️ Tạo bài viết mới</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="post-type-selector">
            {POST_TYPES.map(pt => (
              <button
                key={pt.value}
                type="button"
                className={`type-btn ${type === pt.value ? 'active' : ''}`}
                onClick={() => setType(pt.value)}
              >
                {pt.label}
              </button>
            ))}
          </div>
          <div className="form-group">
            <textarea
              placeholder="Bạn đang nghĩ gì? Hãy chia sẻ kiến thức hoặc đặt câu hỏi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>
          {!groupId && (
            <div className="form-group">
              <label>Môn học (tùy chọn)</label>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Đang đăng...' : '📤 Đăng bài'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
