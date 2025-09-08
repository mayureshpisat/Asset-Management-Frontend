import * as signalR from "@microsoft/signalr";

let connection;

export const startConnection = async () => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl("https:/localhost:7242/Notification") // adjust backend URL
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log("SignalR connected");
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
  }

  return connection;
};

export default startConnection;
