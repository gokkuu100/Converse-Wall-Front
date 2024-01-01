import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io.connect("http://localhost:8000");

const Inbox = () => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [messagesAndImages, setMessagesAndImages] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState([]);

  const sendMessage = async (event) => {
    event.preventDefault();

    try {
      const senderId = localStorage.getItem("senderId");

      let messageObject = {
        senderId,
        receiverId,
        messageText: message.trim(),
        type: "sent",
      };

      if (receiverId && message.trim() !== "") {
        await axios.post("http://localhost:8000/api/messages", {
          senderId,
          receiverId,
          messageText: message.trim(),
        }, {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        });

        socket.emit("send_message", messageObject);

        setMessagesAndImages([...messagesAndImages, { ...messageObject }]);
        setMessage("");
      } else {
        console.error("Select a user and enter a non-empty message to send.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      console.log("Response data:", error.response.data);
    }
  };

  // Handle image selection
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const sendImage = async () => {
    try {
      const senderId = localStorage.getItem("senderId");

      const formData = new FormData();
      formData.append("senderId", senderId);
      formData.append("receiverId", receiverId);
      formData.append("image", image);

      await axios.post("http://localhost:8000/api/upload", formData, {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Image uploaded successfully");
      setImage(null); // Reset the image state after sending
    } catch (error) {
      console.error("Error uploading image:", error);
      console.log("Response data:", error.response.data);
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

  useEffect(() => {
    // Fetch images when the component mounts
    axios
      .get("http://localhost:8000/api/images", {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // Append the fetched images to the existing messagesAndImages state
        setMessagesAndImages((prevMessagesAndImages) => [...prevMessagesAndImages, ...response.data]);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
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
      const sortedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setMessagesAndImages(sortedMessages);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    socket.emit("join_room", localStorage.getItem("senderId"));

    socket.on("receive_message", (data) => {
      setMessagesAndImages([...messagesAndImages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, messagesAndImages]);

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
          {messagesAndImages.map((item, index) => (
            <div
              key={index}
              className={`my-2 p-4 max-w-xs ${
                item.type === "sent"
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-300"
              }`}
            >
              {item.messageText && (
                <div>
                  <p>Sender ID: {item.senderId}</p>
                  <p>Receiver ID: {item.receiverId}</p>
                  <div>
                    <p>Message: {item.messageText}</p>
                  </div>
                  <p>Type: {item.type === "sent" ? "sent" : "received"}</p>
                </div>
              )}
              {item.image_data && (
                <div>
                  <p>Sender ID: {item.senderId}</p>
                  <p>Receiver ID: {item.receiverId}</p>
                  <div>
                    <img
                      src={`data:image/png;base64,${new Uint8Array(item.image_data.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ''
                      )}`}
                      alt="Received Image"
                      style={{ maxWidth: "100%" }}
                    />
                  </div>
                  <p>Type: Image</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 p-4 bg-blue">
          <form onSubmit={sendMessage}>
            <input
              placeholder="Write a message here"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            ></input>
            <button type="submit">Send Message</button>
          </form>
          <form>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button type="button" onClick={sendImage}>Send Image</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
