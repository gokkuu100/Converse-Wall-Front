import { useEffect, useState } from "react";
import axios from "axios";

const SignIn = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/login", {
                name: username,
                password: password
            });
            console.log("Login successful", response.data);
        } catch (error) {
            console.error("Error during login", error)
        }
    }

    return (
        <>
        <form onSubmit={login}>
        <label>Username</label>
        <input
        type="text"
        placeholder="name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        ></input>
        <br />
        <label>Password</label>
        <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        ></input>
        <br />
        <button type="submit">Sign In</button>
        </form>
        </>
    )
}

export default SignIn;