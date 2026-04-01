import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const features = [
  { icon: '📖', title: 'Nhóm học tập', desc: 'Tham gia các nhóm học theo môn học và chủ đề yêu thích của bạn' },
  { icon: '💬', title: 'Bảng tin', desc: 'Chia sẻ kiến thức, đặt câu hỏi và thảo luận cùng cộng đồng' },
  { icon: '👍', title: 'Tương tác', desc: 'Bình luận, thả reaction để giao lưu và kết nối với mọi người' },
  { icon: '🔍', title: 'Tìm kiếm', desc: 'Tìm kiếm và lọc bài viết theo môn học, chủ đề' },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Mạng xã hội <span className="highlight">học tập</span> dành cho bạn
          </h1>
          <p className="hero-desc">
            Kết nối với cộng đồng học sinh, sinh viên. Chia sẻ kiến thức, đặt câu hỏi và cùng nhau tiến bộ.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/feed" className="btn btn-primary btn-lg" style={{width: 'auto'}}>
                  🏠 Vào bảng tin
                </Link>
                <Link to="/groups" className="btn btn-outline btn-lg" style={{width: 'auto'}}>
                  👥 Khám phá nhóm
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" style={{width: 'auto'}}>
                  🚀 Bắt đầu ngay
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg" style={{width: 'auto'}}>
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-post">
              <div className="hp-avatar">A</div>
              <div>
                <div className="hp-name">Alice</div>
                <div className="hp-text">Ai có thể giải thích về Big O notation không? 🤔</div>
              </div>
            </div>
            <div className="hp-reactions">👍 12 &nbsp; ❤️ 5 &nbsp; 💬 8 bình luận</div>
          </div>
        </div>
      </section>

      <section className="features container">
        <h2 className="features-title">Tính năng nổi bật</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Sẵn sàng học cùng nhau?</h2>
        <p>Tham gia hàng nghìn học sinh, sinh viên đang học tập cùng nhau mỗi ngày.</p>
        {!user && (
          <Link to="/register" className="btn btn-primary btn-lg" style={{width: 'auto', margin: '0 auto', display: 'inline-flex'}}>
            Đăng ký miễn phí
          </Link>
        )}
      </section>
    </div>
  );
};

export default HomePage;
