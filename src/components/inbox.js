import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:8000");

const Inbox = () => {
  const [message, setMessage] = useState("");
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);

  const sendMessage = async () => {
    const senderId = localStorage.getItem("senderId");
    if (receiverId) {
      const messageObject = {
        senderId,
        receiverId,
        messageText: message,
        type: "sent",
      };
      socket.emit("send_message", messageObject);
      // No need to update local state here, it will be updated when receiving the message        // Save the message to the database
        try {
            await axios.post("http://localhost:8000/api/messages", JSON.stringify(messageObject), {
                headers: {
                    Authorization: `${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
            });
        } catch (error) {
            console.error("Error saving message:", error);
        }

        // Update local state to display the sent message immediately
        setMessagesReceived([...messagesReceived, { ...messageObject, type: "sent"}]);
    } else {
      console.error("Select a user to send a message to.");
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/users", {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
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

      <div className="flex flex-col">
      {messagesReceived.map((messageObject, index) => (
        <div 
        key={index}>
          <p>Sender ID: {messageObject.senderId}</p>
          <p>Receiver ID: {messageObject.receiverId}</p>
          <div>
          <p>Message: {messageObject.messageText}</p>
          </div>
          <p>Type: {messageObject.type}</p>
        </div>
      ))}
      </div>
    </>
  );
};

export default Inbox;
