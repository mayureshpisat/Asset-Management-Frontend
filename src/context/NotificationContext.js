import React, { createContext, useContext, useEffect, useState } from "react";
import { startConnection } from "../services/signalService";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const {user, isAuthenticated,token}  = useAuth();
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("USER IS NOT LOGGED IN CONNECTION NOT DONE")
      return;
    }; // 🚨 don’t connect before login
    const setupConnection = async () => {
      const userRole = user.role;
      const connection = await startConnection(token);
      

      connection.on("RecieveSignalNotification", (notification)=>{
        notification.timestamp = new Date();
        switch (notification.type){
          case "SignalAdded":
            toast.info(`${notification.user} added signal ${notification.name} under ${notification.parent} `)
            break;
          case "SignalDeleted":
            toast.info(`${notification.user} deleted signal ${notification.name} under ${notification.parent}`)
            break;
          case "SignalUpdated":
            toast.info(`${notification.user} updated asset ${notification.oldName} to ${notification.newName} under ${notification.parent}`)
            break;


        }
      })

      connection.on("RecieveAssetNotification", (notification)=>{
        notification.timestamp = new Date();
        setNotifications(prev => {
        const updated = [...prev, notification];
          console.log(updated);
  return updated;
});
        switch (notification.type){
          case "AssetAdded":
            toast.info(`${notification.user} added asset ${notification.name} `)
            console.log(`${notification.user} added asset ${notification.name} `)

            notifications.map((val)=>{
              console.log(val);
            })
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
    
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for easy usage
export const useNotifications = () => useContext(NotificationContext);
