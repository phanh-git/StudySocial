import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GroupCard from '../components/GroupCard';
import './GroupsPage.css';

const CreateGroupModal = ({ onClose, onCreated, subjects }) => {
  const [form, setForm] = useState({ name: '', description: '', subjectId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        subjectId: form.subjectId ? Number(form.subjectId) : null,
      };
      const res = await api.post('/api/groups', payload);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>👥 Tạo nhóm học tập</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên nhóm *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="VD: Nhóm học Toán Cao Cấp"
              required
            />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả về nhóm học tập..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Môn học</label>
            <select value={form.subjectId} onChange={(e) => setForm(p => ({ ...p, subjectId: e.target.value }))}>
              <option value="">-- Chọn môn học --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </form>
      </div>
    </div>
  );
};

const GroupsPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', subjectId: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    api.get('/api/subjects').then(res => setSubjects(res.data)).catch(() => {});
    fetchGroups(0, { keyword: '', subjectId: '' });
  }, []);

  const fetchGroups = async (pageNum = 0, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, size: 12 });
      if (currentFilters.keyword) params.append('keyword', currentFilters.keyword);
      if (currentFilters.subjectId) params.append('subjectId', currentFilters.subjectId);
      const res = await api.get(`/api/groups?${params}`);
      if (pageNum === 0) {
        setGroups(res.data.content || []);
      } else {
        setGroups(prev => [...prev, ...(res.data.content || [])]);
      }
      setTotalPages(res.data.totalPages || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch groups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchGroups(0, newFilters);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
  };

  const handleGroupUpdate = (updatedGroup) => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  return (
    <div className="groups-page container">
      <div className="groups-header">
        <h1>👥 Nhóm học tập</h1>
        <p>Tham gia các nhóm học theo môn học và chủ đề yêu thích</p>
      </div>

      <div className="groups-toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm nhóm..."
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
        </div>
        <div className="subject-filters">
          <button
            className={`filter-chip ${filters.subjectId === '' ? 'active' : ''}`}
            onClick={() => handleFilterChange('subjectId', '')}
          >
            Tất cả
          </button>
          {subjects.map(s => (
            <button
              key={s.id}
              className={`filter-chip ${filters.subjectId === String(s.id) ? 'active' : ''}`}
              onClick={() => handleFilterChange('subjectId', String(s.id))}
            >
              {s.name}
            </button>
          ))}
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Tạo nhóm
          </button>
        )}
      </div>

      {loading && page === 0 ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : groups.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">👥</div>
          <h3>Chưa có nhóm nào</h3>
          <p>Hãy tạo nhóm học tập đầu tiên!</p>
          {user && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Tạo nhóm ngay
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="groups-grid">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} onUpdate={handleGroupUpdate} />
            ))}
          </div>
          {page < totalPages - 1 && (
            <div style={{textAlign: 'center', marginTop: 20}}>
              <button
                className="btn btn-secondary"
                onClick={() => fetchGroups(page + 1)}
                disabled={loading}
              >
                Xem thêm nhóm
              </button>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleGroupCreated}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default GroupsPage;
