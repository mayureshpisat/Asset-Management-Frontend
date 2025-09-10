// NotificationDropdown.js
import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

function NotificationDropdown() {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown me-3">
      {/* Bell Icon */}
      <button
        className="btn btn-link text-white position-relative"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-bell fs-5"></i>
        {/* Badge */}
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="dropdown-menu dropdown-menu-end show shadow-sm p-2" style={{ minWidth: "300px", maxHeight: "300px", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div className="dropdown-item text-muted">No notifications</div>
          ) : (
            notifications
              .slice() // clone array
              .reverse() // show newest first
              .map((n, i) => (
                <div key={i} className="dropdown-item small">
                  <strong>{n.user}</strong> {n.type === "AssetAdded" ? "added" : n.type === "AssetUpdated" ? "updated" : "deleted"} <em>{n.name}</em>
                  <br />
                  <small className="text-muted">{n.timestamp?.toLocaleString()}</small>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
