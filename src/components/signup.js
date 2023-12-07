import { useState } from "react"

const SignUp = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

const signup = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("/signup", {
            username: username,
            password: password
        });
        console.log("Signup successful", response.data);
    } catch (error) {
        console.error("Error during login", error);
    }
}


return (
    <>
    <form onSubmit={signup}>
    <label>Username</label>
    <input
    type="text"
    placeholder="username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    ></input>
    <br />
    <label>Password</label>
    <input
    type="text"
    placeholder="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    ></input>
    <br /> 
    <button type="submit">Sign Up</button>
    </form>
    </>
)
}

export default SignUp;