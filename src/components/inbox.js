import React, { useEffect, useState } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:8000")

const Inbox = () => {
    const [message, setMessage] = useState("")
    const [messageReceived, setMessageReceived] = useState("")
    const sendMessage = () => {
        socket.emit("send_message", {message})
    }
    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessageReceived(data.message)
        })
    })
    return (
        <>
        <input
        placeholder="write message here"
        onChange={(event) => {
            setMessage(event.target.value);
        }}
        >
        </input>
        <button
        onClick={sendMessage}
        >Send</button>
        <p>{messageReceived}</p>
        </>
    )
}

export default Inbox;