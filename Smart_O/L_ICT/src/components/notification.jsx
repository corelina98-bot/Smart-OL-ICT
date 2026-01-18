import React, { useState, useEffect } from "react";
import "./notification.css";
import { Bell, MoreVertical, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Notification() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications");
      // Transform API data to match component structure
      const transformedNotifications = response.data.map(notif => ({
        id: notif._id,
        title: notif.title,
        desc: notif.desc,
        isRead: false // Client-side read status
      }));
      setNotifications(transformedNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    setActiveMenuId(null);
  };

  return (
    <div className="notify-bg">
      <div className="notify-card">

        {/* Header with Back Button */}
        <div className="notify-header">
          <button 
            className="back-btn" 
            onClick={() => navigate("/setting")}
          >
            <ArrowLeft size={20} />Back
          </button>

          <div className="notify-title">
            <img
              className="settings-logo"
              src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
              alt="logo"
            />
            <Bell size={22} />
            <h2>Notifications</h2>
          </div>
          <span className="notify-sub">Smart O/L ICT</span>
        </div>

        {/* Notification List */}
        <div className="notify-list">
          {notifications.map((item) => (
            <div key={item.id} className={`notify-item ${item.isRead ? 'read' : ''}`}>
              <div className="notify-icon">
                <Bell size={18} />
              </div>
              <div className="notify-content">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <MoreVertical
                className="notify-more"
                size={18}
                onClick={() => handleMenuToggle(item.id)}
              />
              {activeMenuId === item.id && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => handleMarkAsRead(item.id)}>
                    Mark as Read
                  </div>
                  <div className="dropdown-item" onClick={() => handleDelete(item.id)}>
                    Delete
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
