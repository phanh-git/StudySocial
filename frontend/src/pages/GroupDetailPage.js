import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import './GroupDetailPage.css';

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGroup();
    fetchGroupPosts(0);
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/api/groups/${id}`);
      setGroup(res.data);
    } catch {
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async (pageNum = 0) => {
    setPostsLoading(true);
    try {
      const res = await api.get(`/api/posts?groupId=${id}&page=${pageNum}&size=10`);
      if (pageNum === 0) {
        setPosts(res.data.content || []);
      } else {
        setPosts(prev => [...prev, ...(res.data.content || [])]);
      }
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch group posts error:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      const res = await api.post(`/api/groups/${id}/join`);
      setGroup(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Đã xảy ra lỗi');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Bạn có muốn rời nhóm này không?')) return;
    try {
      await api.delete(`/api/groups/${id}/leave`);
      setGroup(prev => ({ ...prev, isMember: false, memberCount: prev.memberCount - 1 }));
    } catch (err) {
      alert(err.response?.data?.error || 'Đã xảy ra lỗi');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  if (loading) return <div className="loading-center container"><div className="spinner"></div></div>;
  if (!group) return null;

  return (
    <div className="group-detail-page container">
      <div className="group-detail-header card">
        <div className="group-detail-icon">
          {group.subject ? group.subject.name[0] : '📚'}
        </div>
        <div className="group-detail-info">
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
          <div className="group-detail-meta">
            {group.subject && <span className="badge badge-purple">📖 {group.subject.name}</span>}
            <span className="member-count">👥 {group.memberCount} thành viên</span>
            <span className="creator">Tạo bởi {group.creator?.username}</span>
          </div>
        </div>
        <div className="group-detail-actions">
          {user && (
            group.isMember ? (
              <button className="btn btn-secondary" onClick={handleLeave}>✓ Đã tham gia</button>
            ) : (
              <button className="btn btn-primary" onClick={handleJoin}>+ Tham gia</button>
            )
          )}
        </div>
      </div>

      <div className="group-detail-feed">
        {user && group.isMember && (
          <div className="create-post-bar card" onClick={() => setShowCreateModal(true)}>
            <div className="avatar">{user.username[0].toUpperCase()}</div>
            <div className="create-prompt">Đăng bài trong nhóm...</div>
            <button className="btn btn-primary btn-sm">Đăng bài</button>
          </div>
        )}

        {postsLoading && page === 0 ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : posts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📭</div>
            <h3>Chưa có bài viết nào trong nhóm</h3>
            {user && group.isMember && (
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                Đăng bài đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
                onUpdate={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))}
              />
            ))}
            {page < totalPages - 1 && (
              <button className="btn btn-secondary load-more" onClick={() => fetchGroupPosts(page + 1)} disabled={postsLoading}>
                {postsLoading ? 'Đang tải...' : 'Xem thêm'}
              </button>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
          groupId={Number(id)}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;
