import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: user?.bio || '', avatarUrl: user?.avatarUrl || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/api/users/me', form);
      await refreshUser();
      setEditing(false);
      setSuccess('Cập nhật thành công!');
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (username) => username ? username[0].toUpperCase() : '?';

  const roleLabel = user.role === 'ADMIN' ? '⭐ Admin' : '👤 Người dùng';

  return (
    <div className="profile-page container">
      <div className="profile-card card">
        <div className="profile-header">
          <div className="avatar avatar-lg">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} />
            ) : (
              getInitial(user.username)
            )}
          </div>
          <div className="profile-info">
            <h1>{user.username}</h1>
            <p className="user-email">{user.email}</p>
            <span className="badge badge-purple">{roleLabel}</span>
          </div>
          {!editing && (
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
              ✏️ Chỉnh sửa
            </button>
          )}
        </div>

        {user.bio && !editing && (
          <div className="profile-bio">
            <p>{user.bio}</p>
          </div>
        )}

        {editing && (
          <form className="edit-profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Giới thiệu bản thân</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Viết vài dòng về bản thân..."
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>URL ảnh đại diện</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm(p => ({ ...p, avatarUrl: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="edit-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}

        {success && <p className="success-text">{success}</p>}

        <div className="profile-joined">
          <span>📅 Tham gia từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
