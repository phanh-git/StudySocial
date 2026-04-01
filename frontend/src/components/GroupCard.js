import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './GroupCard.css';

const GroupCard = ({ group, onUpdate }) => {
  const { user } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/groups/${group.id}/join`);
      onUpdate && onUpdate(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Đã xảy ra lỗi');
    }
  };

  const handleLeave = async (e) => {
    e.preventDefault();
    if (!window.confirm('Bạn có muốn rời nhóm này không?')) return;
    try {
      await api.delete(`/api/groups/${group.id}/leave`);
      onUpdate && onUpdate({ ...group, isMember: false, memberCount: group.memberCount - 1 });
    } catch (err) {
      alert(err.response?.data?.error || 'Đã xảy ra lỗi');
    }
  };

  return (
    <Link to={`/groups/${group.id}`} className="group-card card">
      <div className="group-icon">
        {group.subject ? group.subject.name[0] : '📚'}
      </div>
      <div className="group-info">
        <h3 className="group-name">{group.name}</h3>
        {group.description && (
          <p className="group-desc">{group.description}</p>
        )}
        <div className="group-meta">
          {group.subject && (
            <span className="badge badge-purple">{group.subject.name}</span>
          )}
          <span className="member-count">👥 {group.memberCount} thành viên</span>
        </div>
      </div>
      {user && (
        <div className="group-action" onClick={(e) => e.preventDefault()}>
          {group.isMember ? (
            <button className="btn btn-secondary btn-sm" onClick={handleLeave}>
              ✓ Đã tham gia
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleJoin}>
              + Tham gia
            </button>
          )}
        </div>
      )}
    </Link>
  );
};

export default GroupCard;
