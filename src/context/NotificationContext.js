import React, { createContext, useContext, useEffect, useState } from "react";
import { startConnection } from "../services/signalService";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { notificationService } from "../services/notificationService";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]); //for realtime notification by signal r
  const [storedNotifications, setStoredNotifications] = useState([]); // For stored notifications from DB
  const [connection, setConnection] = useState(null);
  const { user, isAuthenticated } = useAuth(); // Removed token since we're using cookies

  // Fetch stored notifications when user logs in (only for admins)
    // Clear notifications when user logs out
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setStoredNotifications([]);
      
      // Close SignalR connection when user logs out
      if (connection) {
        connection.stop().catch(console.error);
        setConnection(null);
      }
    }
  }, [user]); // Fixed: Added user as dependency

  useEffect(() => {
    if (isAuthenticated() && user && user.role === "Admin") {
      fetchStoredNotifications();
    }
  }, [isAuthenticated, user?.id, notifications]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    
    if (!isAuthenticated() || !user) {
      console.log("USER IS NOT LOGGED IN CONNECTION NOT DONE");
      return;
    }

    const setupConnection = async () => {
      try {
        // Close existing connection if any
        if (connection) {
          await connection.stop();
        }

        const newConnection = await startConnection(); // No token needed for cookie auth
        
        if (!isMounted) return; // Component unmounted during async operation
        
        setConnection(newConnection);

        // Set up notification handlers
        newConnection.on("RecieveSignalNotification", (notification) => {
          if (!isMounted) return;
          
          notification.timestamp = new Date();
          
          // Add to notifications state
          setNotifications(prev => [...prev, notification]);
          
          // Show toast
          switch (notification.type) {
            case "SignalAdded":
              toast.info(`${notification.user} added signal ${notification.name} under ${notification.parentName}`);
              break;
            case "SignalDeleted":
              toast.info(`${notification.user} deleted signal ${notification.name} under ${notification.parentName}`);
              break;
            case "SignalUpdated":
              toast.info(`${notification.user} updated signal ${notification.oldName} to ${notification.newName} under ${notification.parentName}`);
              break;
            default:
              break;
          }

          // Fetch updated stored notifications after receiving real-time notification
          if (user && user.role === "Admin") {
            fetchStoredNotifications();
          }
        });

        

        newConnection.on("RecieveAssetNotification", (notification) => {
          if (!isMounted) return;
          
          notification.timestamp = new Date();
          
          // Add to notifications state
          setNotifications(prev => {
            const updated = [...prev, notification];
            console.log("Updated notifications:", updated);
            return updated;
          });
          
          // Show toast
          switch (notification.type) {
            case "AssetAdded":
              toast.info(`${notification.user} added asset ${notification.name}`);
              console.log(`${notification.user} added asset ${notification.name}`);
              break;
            case "AssetDeleted":
              toast.info(`${notification.user} deleted asset ${notification.name}`);
              break;
            case "AssetUpdated":
              toast.info(`${notification.user} updated asset ${notification.oldName} to ${notification.newName}`);
              break;
            case "AssetReorder":
              toast.info(`${notification.user} reordered the hierarchy`);
              break;
            default:
              break;
          }

          // Fetch updated stored notifications after receiving real-time notification
          if (user && user.role === "Admin") {
            fetchStoredNotifications();
          }
        });

        newConnection.on("RecieveStatsNotification", (tempAvg, powerAvg)=>{
          toast.info(`Average temperature for this asset is ${tempAvg} and average power consumed for this asset is ${powerAvg}`)
        })

      } catch (error) {
        console.error("Error setting up SignalR connection:", error);
      }
    };

    setupConnection();

    // Cleanup function
    return () => {
      isMounted = false;
      if (connection) {
        connection.stop().catch(console.error);
      }
    };
  }, [isAuthenticated, user?.id]); // Only depend on user.id to avoid unnecessary reconnections

  // Fetch stored notifications from the database
  const fetchStoredNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const notifications = await notificationService.getUserNotifications(user.id);
      setStoredNotifications(notifications);
    } catch (error) {
      console.error("Error fetching stored notifications:", error);
    }
  };

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds) => {
    try {
      await notificationService.markNotificationsAsRead(notificationIds);
      // Update local state
      setStoredNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllNotificationsAsRead(user.id);
      // Update local state
      setStoredNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.clearAllNotifications(user.id);
      setStoredNotifications([]);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const value = {
    storedNotifications,
    notifications,
    connection,
    setNotifications,
    fetchStoredNotifications,
    markAllNotificationsAsRead,
    markNotificationsAsRead,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy usage
export const useNotifications = () => useContext(NotificationContext);