import React, { createContext, useContext, useEffect, useState } from "react";
import { startConnection } from "../services/signalService";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);
  const { user, isAuthenticated } = useAuth(); // Removed token since we're using cookies

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
              toast.info(`${notification.user} added signal ${notification.name} under ${notification.parent}`);
              break;
            case "SignalDeleted":
              toast.info(`${notification.user} deleted signal ${notification.name} under ${notification.parent}`);
              break;
            case "SignalUpdated":
              toast.info(`${notification.user} updated signal ${notification.oldName} to ${notification.newName} under ${notification.parent}`);
              break;
            default:
              break;
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
            default:
              break;
          }
        });

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

  const value = {
    notifications,
    connection
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy usage
export const useNotifications = () => useContext(NotificationContext);