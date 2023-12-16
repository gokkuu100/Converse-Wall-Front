// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import axios from "axios";

// const socket = io.connect("http://localhost:8000");

// const Inbox = () => {
//   const [message, setMessage] = useState("");
//   const [messagesReceived, setMessagesReceived] = useState([]); // Change to an array
//   const [receiverId, setReceiverId] = useState("");
//   const [senderId, setSenderId] = useState("");
//   const [users, setUsers] = useState([]);

//   const sendMessage = () => {
//     const senderId = localStorage.getItem("senderId");
//     // Check if a receiver is selected before sending a message
//     if (receiverId) {
//       const messageObject = {
//         senderId,
//         receiverId,
//         message,
//         type: "sent", // Add a 'type' property to indicate sent message
//       };

//       socket.emit("send_message", messageObject);
//       // Update local state to display the sent message immediately
//       setMessagesReceived([...messagesReceived, messageObject]);
//     } else {
//       console.error("Select a user to send a message to.");
//     }
//   };

//   useEffect(() => {
//     // Fetch the list of users after the component mounts
//     axios
//       .get("http://localhost:8000/api/users", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       })
//       .then((response) => {
//         setUsers(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching users:", error);
//       });
//   }, []);

//   const handleUserSelection = (selectedUserId) => {
//     setReceiverId(selectedUserId);
//   };

//   useEffect(() => {
//     // Join the room when the component mounts
//     socket.emit("join_room", 3);

//     // Listen for messages in the user's room
//     socket.on("receive_message", (data) => {
//       setMessagesReceived([...messagesReceived, data]); // Add received message to state
//     });

//     // Clean up the socket event listener on component unmount
//     return () => {
//       socket.off("receive_message");
//     };
//   }, [receiverId, messagesReceived]); // Add messagesReceived as a dependency

//   return (
//     <>
//       {/* User selection dropdown */}
//       <select onChange={(e) => handleUserSelection(e.target.value)}>
//         <option value="">Select a user</option>
//         {users.map((user) => (
//           <option key={user.id} value={user.id}>
//             {user.name}
//           </option>
//         ))}
//       </select>

//       <input
//         placeholder="write message here"
//         onChange={(event) => {
//           setMessage(event.target.value);
//         }}
//       ></input>
//       <button onClick={sendMessage}>Send</button>
//       {/* Map over the array of messages to display them */}
//       {messagesReceived.map((messageObject, index) => (
//         <div key={index}>
//           <p>Sender ID: {messageObject.senderId}</p>
//           <p>Receiver ID: {messageObject.receiverId}</p>
//           <p>Message: {messageObject.message}</p>
//           <p>Type: {messageObject.type}</p>
//         </div>
//       ))}
//     </>
//   );
// };

// export default Inbox;

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
