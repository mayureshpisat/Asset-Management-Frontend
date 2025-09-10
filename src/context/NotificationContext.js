import React, { createContext, useContext, useEffect, useState } from "react";
import { startConnection } from "../services/signalService";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const setupConnection = async () => {
      const connection = await startConnection();

      connection.on("RecieveSignalNotification", (notification)=>{
        notification.timestamp = new Date();
        switch (notification.type){
          case "SignalAdded":
            toast.info(`${notification.user} added signal ${notification.name} `)
            break;
          case "SignalDeleted":
            toast.info(`${notification.user} deleted signal ${notification.name}`)
            break;
          case "SignalUpdated":
            toast.info(`${notification.user} updated asset ${notification.oldName} to ${notification.newName}`)
            break;


        }
      })

      connection.on("RecieveAssetNotification", (notification)=>{
        notification.timestamp = new Date();
        switch (notification.type){
          case "AssetAdded":
            toast.info(`${notification.user} added asset ${notification.name} `)
            console.log(notifications)
            break;
          case "AssetDeleted":
            toast.info(`${notification.user} deleted asset ${notification.name}`)
            break;
          case "AssetUpdated":
            toast.info(`${notification.user} updated asset ${notification.oldName} to ${notification.newName}`)
            break;


        }
      })

    


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
