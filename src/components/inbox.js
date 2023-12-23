import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:8000");

const Inbox = () => {
  const [message, setMessage] = useState("");
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

  const sendMessage = async () => {
    try {
        const senderId = localStorage.getItem("senderId");

        if (receiverId && (message.trim() !== "" || selectedImage)) {
            // Prepare the message object
            const messageObject = {
                senderId,
                receiverId,
                messageText: message.trim(),
                type: "sent",
                imageUrl: selectedImage, // Add the selected image URL
            };

            // Send the message to the server
            socket.emit("send_message", messageObject);

            // Save the message to the database
            try {
                await axios.post(
                    "http://localhost:8000/api/messages",
                    JSON.stringify(messageObject),
                    {
                        headers: {
                            Authorization: `${localStorage.getItem("token")}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } catch (error) {
                console.error("Error saving message:", error);
            }

            // Update local state to display the sent message immediately
            setMessagesReceived([...messagesReceived, { ...messageObject, type: "sent" }]);
            setMessage(""); // Clear the input field after sending the message
            setSelectedImage(""); // Clear the selected image
        } else {
            console.error("Select a user and enter a non-empty message to send.");
        }
    } catch (error) {
        console.error("Error sending message:", error);
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

  const handleUserSelection = async (selectedUserId) => {
    setReceiverId(selectedUserId);

    try {
      const response = await axios.get(`http://localhost:8000/api/conversations/${selectedUserId}`, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      // const combinedMessages = [...messagesReceived, ...response.data]
      const sortedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessagesReceived(sortedMessages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
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
    <div className="flex">
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className="cursor-pointer hover:bg-gray-200 p-2"
              onClick={() => handleUserSelection(user.id)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-4">
        <div className="flex flex-col justify-between items-end overflow-y-auto max-h-screen">
          {messagesReceived.map((messageObject, index) => (
            <div
              key={index}
              className={`my-2 p-4 max-w-xs ${
                messageObject.type === "sent"
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-300"
              }`}
            >
              <p>Sender ID: {messageObject.senderId}</p>
              <p>Receiver ID: {messageObject.receiverId}</p>
              <div>
                <p>Message: {messageObject.messageText}</p>
              </div>
              <p>Type: {messageObject.type === "sent" ? "sent" : "received"}</p>
            </div>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 p-4 bg-blue">
          <input
            placeholder="Write a message here"
            onChange={(event) => setMessage(event.target.value)}
          ></input>
          <button onClick={sendMessage}>Send</button><br />
        </div><br />
        <div className="fixed inset-x-0 p-4 bg-blue">
          <input
              type="text"
              placeholder="Write a message here"
              onChange={(event) => setMessage(event.target.value)}
          ></input>
          <input
              type="file"
              onChange={handleImageChange}
          ></input>
          <button onClick={sendMessage}>Send</button>
      </div>
      </div>
    </div>
  );
};

export default Inbox;
 