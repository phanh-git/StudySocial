import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import './FeedPage.css';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', subjectId: '', type: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    api.get('/api/subjects').then(res => setSubjects(res.data)).catch(() => {});
  }, []);

  const fetchPosts = useCallback(async (pageNum = 0, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, size: 10 });
      if (currentFilters.keyword) params.append('keyword', currentFilters.keyword);
      if (currentFilters.subjectId) params.append('subjectId', currentFilters.subjectId);
      if (currentFilters.type) params.append('type', currentFilters.type);
      const res = await api.get(`/api/posts?${params}`);
      if (pageNum === 0) {
        setPosts(res.data.content || []);
      } else {
        setPosts(prev => [...prev, ...(res.data.content || [])]);
      }
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0, filters);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchPosts(0, newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(0, filters);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDelete = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  return (
    <div className="feed-page container">
      <div className="feed-layout">
        <aside className="feed-sidebar">
          <div className="card sidebar-card">
            <h3>🔍 Lọc bài viết</h3>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Tìm kiếm</button>
            </form>
            <div className="divider" />
            <h4>Loại bài viết</h4>
            <div className="filter-options">
              {[
                { value: '', label: '🌐 Tất cả' },
                { value: 'QUESTION', label: '❓ Câu hỏi' },
                { value: 'SHARE', label: '📎 Chia sẻ' },
                { value: 'DISCUSSION', label: '💬 Thảo luận' },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`filter-btn ${filters.type === opt.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('type', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="divider" />
            <h4>Môn học</h4>
            <div className="filter-options">
              <button
                className={`filter-btn ${filters.subjectId === '' ? 'active' : ''}`}
                onClick={() => handleFilterChange('subjectId', '')}
              >
                🌐 Tất cả
              </button>
              {subjects.map(s => (
                <button
                  key={s.id}
                  className={`filter-btn ${filters.subjectId === String(s.id) ? 'active' : ''}`}
                  onClick={() => handleFilterChange('subjectId', String(s.id))}
                >
                  📖 {s.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="feed-main">
          {user && (
            <div className="create-post-bar card" onClick={() => setShowCreateModal(true)}>
              <div className="avatar">{user.username[0].toUpperCase()}</div>
              <div className="create-prompt">Bạn đang nghĩ gì? Chia sẻ kiến thức hoặc đặt câu hỏi...</div>
              <button className="btn btn-primary btn-sm">Đăng bài</button>
            </div>
          )}

          {loading && page === 0 ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : posts.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📭</div>
              <h3>Chưa có bài viết nào</h3>
              <p>Hãy là người đầu tiên đăng bài!</p>
              {user && (
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  Đăng bài ngay
                </button>
              )}
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handlePostDelete}
                  onUpdate={handlePostUpdate}
                />
              ))}
              {page < totalPages - 1 && (
                <button
                  className="btn btn-secondary load-more"
                  onClick={() => fetchPosts(page + 1)}
                  disabled={loading}
                >
                  {loading ? 'Đang tải...' : 'Xem thêm bài viết'}
                </button>
              )}
            </>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default FeedPage;
