import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignIn = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate();
    

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/login", {
                name: username,
                password: password
            });
            console.log("Login successful", response.data);

            // stores token from the backend
            localStorage.setItem('token',response.data.token);
            
            // navigate to next page
            navigate("/dashboard");
        } catch (error) {
            console.error("Error during login:", error)
            setError("Invalid username or password")
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
        {error && <p style={{ color: "red"}}>{error}</p>}
        </>
    )
}

export default SignIn;