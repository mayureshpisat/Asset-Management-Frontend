import React, { createContext, useContext, useEffect, useState } from "react";
import { startConnection } from "../services/signalService";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const setupConnection = async () => {
      const connection = await startConnection();

      connection.on("ReceiveMessage", (user, message) => {
        const notification = { user, message, timestamp: new Date() };

        // Store in state
        setNotifications((prev) => [...prev, notification]);

        // Show a toast popup
        toast.info(`${user}: ${message}`);
        console.log(`${user}: ${message}`);
      });

      connection.on("UpdateSignal", (user, message) => {
        const notification = { user, message, timestamp: new Date() };

        // Store in state
        setNotifications((prev) => [...prev, notification]);
        toast.info(`${user} : ${message}`)

        console.log(`${user} : ${message}`);
        
      });

      connection.on("DeleteSignal", (user, message) => {
        const notification = { user, message, timestamp: new Date() };

        // Store in state
        setNotifications((prev) => [...prev, notification]);
        toast.info(`${user} : ${message}`)

        console.log(`${user} : ${message}`);
        
      });


    


    };

    setupConnection();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy usage
export const useNotifications = () => useContext(NotificationContext);
