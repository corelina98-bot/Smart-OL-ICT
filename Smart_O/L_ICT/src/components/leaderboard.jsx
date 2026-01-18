import React, { useState, useEffect } from "react";
import "./leaderboard.css";
import { useNavigate } from "react-router-dom";


function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data.map((item, index) => ({
        rank: index + 1,
        name: item.username,
        score: item.totalScore
      }))))
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  return (
    <>
    <style>
      {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
/* Reset and Base Styles */
body, html {
            margin: 0; padding: 0; height: 100%;
            font-family: 'Orbitron', sans-serif;
            color: #eee;
            overflow: hidden;
          }
      `}
    </style>
    <div className="leaderboard-container">

      <div className="logo-container" aria-label="Smart O/L ICT Logo">
            <img src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand" alt="Smart O/L ICT Logo" />
          </div>

      {/* LEFT SIDE */}
      <div className="left-board">
        <h2 className="title">Leaderboard</h2>

        <div className="you-box">
          <span className="you-icon">👤</span>
          <span className="you-text">You</span>
        </div>

        <div className="list">
          {leaderboard.map((item) => (
            <div key={item.rank} className="list-item">
              <span className="rank">{item.rank}</span>
              <span className="user-icon">👤</span>
              <span className="name">{item.name}</span>
              <span className="score">{item.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-board">

        {/* Hamburger menu top-right */}
        <div 
          className="menu-icon" 
          aria-label="Menu" 
          role="button" 
          tabIndex={0}
          style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10}}
          onClick={() => navigate('/dashboard')} // Add navigation to dashboard
        >
          <div></div>
          <div></div>
          <div></div>
        </div>

        <h2 className="title">Leaderboard</h2>

        <div className="top3-container">
          <div className="mini-card second">
            <div className="top-icon">👤</div>
            <div className="top-rank">2</div>
            <div className="top-name">name</div>
            <div className="top-score">500</div>
          </div>

          <div className="mini-card first">
            <div className="top-icon">👤</div>
            <div className="top-rank">1</div>
            <div className="top-name">name</div>
            <div className="top-score">600</div>
          </div>

          <div className="mini-card third">
            <div className="top-icon">👤</div>
            <div className="top-rank">3</div>
            <div className="top-name">name</div>
            <div className="top-score">400</div>
          </div>
        </div>

        <div className="podium">
          <div className="podium-block second">2</div>
          <div className="podium-block first">1</div>
          <div className="podium-block third">3</div>
        </div>
      </div>

    </div>
    </>
  );
}

export default Leaderboard;
