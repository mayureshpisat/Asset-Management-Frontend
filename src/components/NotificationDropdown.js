import React, { useState, useMemo } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

function NotificationDropdown() {
  
  const { user } = useAuth();
  const { 
    storedNotifications, 
    markNotificationsAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications 
  } = useNotifications();
  const [open, setOpen] = useState(false);
  
  // Format stored notifications for display
  const allNotifications = useMemo(() => {
    return storedNotifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      senderName: n.senderName,
      isRead: n.isRead,
      timestamp: new Date(n.createdAt)
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [storedNotifications]);

  // Only render for admin users
  if (!user || user.role !== "Admin") {
    return null;
  }

  // Count unread notifications
  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  // Handle marking single notification as read
  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
      await markNotificationsAsRead([notification.id]);
    }
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  // Handle clearing all notifications
  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      await clearAllNotifications();
    }
  };

  return (
    <div className="dropdown me-3">
      {/* Bell Icon */}
      <button
        className="btn btn-link text-white position-relative"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-bell fs-5"></i>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="dropdown-menu dropdown-menu-end show shadow-sm" style={{ minWidth: "350px", maxHeight: "400px" }}>
          {/* Header */}
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Notifications</h6>
            <div>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-link btn-sm p-0 me-2 text-primary"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <i className="bi bi-check-all"></i>
                </button>
              )}
              <button 
                className="btn btn-link btn-sm p-0 text-danger"
                onClick={handleClearAll}
                title="Clear all"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div className="dropdown-divider"></div>

          {/* Notifications List */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {allNotifications.length === 0 ? (
              <div className="dropdown-item-text text-muted text-center py-3">
                No notifications
              </div>
            ) : (
              allNotifications.map((notification, index) => (
                <div 
                  key={notification.id || index} 
                  className={`dropdown-item small ${!notification.isRead ? 'bg-light' : ''}`}
                  onClick={() => handleMarkAsRead(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-bold text-truncate">
                        {notification.senderName}
                      </div>
                      <div className="text-muted small">
                        {notification.message}
                      </div>
                      <small className="text-muted">
                        {notification.timestamp?.toLocaleString()}
                      </small>
                    </div>
                    {!notification.isRead && (
                      <span className="badge bg-primary rounded-pill ms-2">•</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;