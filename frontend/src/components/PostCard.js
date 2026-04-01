import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CommentSection from './CommentSection';
import './PostCard.css';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Thích' },
  { type: 'LOVE', emoji: '❤️', label: 'Yêu thích' },
  { type: 'HAHA', emoji: '😄', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Buồn' },
  { type: 'ANGRY', emoji: '😡', label: 'Phẫn nộ' },
];

const TYPE_LABELS = {
  QUESTION: { label: 'Câu hỏi', className: 'badge-yellow' },
  SHARE: { label: 'Chia sẻ', className: 'badge-blue' },
  DISCUSSION: { label: 'Thảo luận', className: 'badge-green' },
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [currentReaction, setCurrentReaction] = useState(post.currentUserReaction);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const getInitial = (username) => username ? username[0].toUpperCase() : '?';

  const handleReact = async (reactionType) => {
    if (!user) return;
    setShowReactions(false);
    try {
      if (liked && currentReaction === reactionType) {
        const res = await api.delete(`/api/posts/${post.id}/reactions`);
        setLikeCount(res.data.likeCount);
        setLiked(false);
        setCurrentReaction(null);
      } else {
        const res = await api.post(`/api/posts/${post.id}/reactions`, { reactionType });
        setLikeCount(res.data.likeCount);
        setLiked(true);
        setCurrentReaction(reactionType);
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/posts/${post.id}`, { content: editContent });
      onUpdate && onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      onDelete && onDelete(post.id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const currentReactionObj = REACTIONS.find(r => r.type === currentReaction);
  const typeInfo = TYPE_LABELS[post.type] || TYPE_LABELS.DISCUSSION;

  return (
    <div className="post-card card">
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.username} />
            ) : (
              getInitial(post.author?.username)
            )}
          </div>
          <div>
            <div className="author-name">{post.author?.username}</div>
            <div className="post-meta">
              <span className={`badge ${typeInfo.className}`}>{typeInfo.label}</span>
              {post.subject && <span className="subject-tag">📖 {post.subject.name}</span>}
              <span className="post-time">{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {user && user.id === post.author?.id && (
          <div className="post-actions-menu">
            <button className="menu-btn" onClick={() => setIsEditing(!isEditing)}>✏️</button>
            <button className="menu-btn danger" onClick={handleDelete}>🗑️</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Hủy</button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : (
        <div className="post-content">{post.content}</div>
      )}

      <div className="post-stats">
        {likeCount > 0 && (
          <span className="stat-item">
            {liked && currentReactionObj ? currentReactionObj.emoji : '👍'} {likeCount}
          </span>
        )}
        {post.commentCount > 0 && (
          <span className="stat-item">{post.commentCount} bình luận</span>
        )}
      </div>

      <div className="post-footer">
        <div
          className="reaction-wrapper"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            className={`action-btn ${liked ? 'active' : ''}`}
            onClick={() => handleReact(currentReaction || 'LIKE')}
            disabled={!user}
          >
            {liked && currentReactionObj ? currentReactionObj.emoji : '👍'}
            {' '}
            {liked && currentReactionObj ? currentReactionObj.label : 'Thích'}
          </button>
          {showReactions && user && (
            <div className="reaction-picker">
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  className={`reaction-btn ${currentReaction === r.type ? 'selected' : ''}`}
                  onClick={() => handleReact(r.type)}
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 Bình luận
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
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
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default PostCard;
