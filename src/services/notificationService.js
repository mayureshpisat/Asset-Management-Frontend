// services/notificationService.js
const API_BASE_URL = 'https://localhost:7242/api';

export const notificationService = {
  // Get all notifications for a user
  getUserNotifications: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Notification/user/${userId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("FROM USER NOTIFICATIONS")
      console.log(response.status)
      return await response.json();


    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark specific notifications as read
  markNotificationsAsRead: async (notificationIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Notification/mark-read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationIds),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read for a user
  markAllNotificationsAsRead: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Notification/mark-all-read/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Clear all notifications for a user
  clearAllNotifications: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Notification/clear/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },
};