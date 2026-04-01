import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CommentSection.css';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchComments(0);
  }, [postId]);

  const fetchComments = async (pageNum) => {
    try {
      const res = await api.get(`/api/posts/${postId}/comments?page=${pageNum}&size=10`);
      if (pageNum === 0) {
        setComments(res.data.content || []);
      } else {
        setComments(prev => [...prev, ...(res.data.content || [])]);
      }
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/posts/${postId}/comments`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Submit comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await api.delete(`/api/posts/${postId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const getInitial = (username) => username ? username[0].toUpperCase() : '?';

  if (loading) return <div className="comments-loading"><div className="spinner"></div></div>;

  return (
    <div className="comment-section">
      {user && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="avatar avatar-sm">{getInitial(user.username)}</div>
          <div className="comment-input-wrapper">
            <input
              type="text"
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? '...' : '↵'}
            </button>
          </div>
        </form>
      )}

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="avatar avatar-sm">
              {comment.author?.avatarUrl ? (
                <img src={comment.author.avatarUrl} alt={comment.author.username} />
              ) : (
                getInitial(comment.author?.username)
              )}
            </div>
            <div className="comment-body">
              <div className="comment-bubble">
                <span className="comment-author">{comment.author?.username}</span>
                <p className="comment-text">{comment.content}</p>
              </div>
              <div className="comment-footer">
                <span className="comment-time">{formatDate(comment.createdAt)}</span>
                {user && user.id === comment.author?.id && (
                  <button className="delete-comment-btn" onClick={() => handleDelete(comment.id)}>
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {page < totalPages - 1 && (
          <button className="load-more-btn" onClick={() => fetchComments(page + 1)}>
            Xem thêm bình luận
          </button>
        )}
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

export default CommentSection;
