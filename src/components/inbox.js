import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:8000");

const Inbox = () => {
  const [message, setMessage] = useState("");
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);

  const sendMessage = () => {
    const senderId = localStorage.getItem("senderId");
    if (receiverId) {
      const messageObject = {
        senderId,
        receiverId,
        message,
        type: "sent",
      };
      socket.emit("send_message", messageObject);
      // No need to update local state here, it will be updated when receiving the message
    } else {
      console.error("Select a user to send a message to.");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleUserSelection = (selectedUserId) => {
    setReceiverId(selectedUserId);
  };

  useEffect(() => {
    socket.emit("join_room", localStorage.getItem("senderId"));

    socket.on("receive_message", (data) => {
      setMessagesReceived([...messagesReceived, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [messagesReceived]);

  return (
    <>
      <select onChange={(e) => handleUserSelection(e.target.value)}>
        <option value="">Select a user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <input
        placeholder="write message here"
        onChange={(event) => setMessage(event.target.value)}
      ></input>
      <button onClick={sendMessage}>Send</button>

      {messagesReceived.map((messageObject, index) => (
        <div key={index}>
          <p>Sender ID: {messageObject.senderId}</p>
          <p>Receiver ID: {messageObject.receiverId}</p>
          <p>Message: {messageObject.message}</p>
          <p>Type: {messageObject.type}</p>
        </div>
      ))}
    </>
  );
};

export default Inbox;
