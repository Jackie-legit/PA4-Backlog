import Projects from "./Project";
import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("signup");

  const [formData, setFormData] = useState({
    f_name: "",
    l_name: "",
    username: "",
    password: "",
  });

  // Handles typing in all input boxes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SIGN UP
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");

        setFormData({
          f_name: "",
          l_name: "",
          username: "",
          password: "",
        });

        setPage("login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Could not connect to server.");
    }
  };

  // LOG IN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successful!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to server.");
    }
  };

  return (
    <>
    <div className="app">
      <div className="card">

        <h1>
          {page === "signup" ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="subtitle">
          {page === "signup"
            ? "Sign up to create your account"
            : "Log in to your account"}
        </p>

        {page === "signup" ? (
          <form onSubmit={handleSignup}>

            <div className="name-row">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  name="f_name"
                  placeholder="First name"
                  value={formData.f_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="l_name"
                  placeholder="Last name"
                  value={formData.l_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Sign Up</button>

            <p className="switch-text">
              Already have an account?{" "}
              <span onClick={() => setPage("login")}>
                Log in
              </span>
            </p>

          </form>
        ) : (
          <form onSubmit={handleLogin}>

            <div className="field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">Log In</button>

            <p className="switch-text">
              Don't have an account?{" "}
              <span onClick={() => setPage("signup")}>
                Sign up
              </span>
            </p>

          </form>
        )}

      </div>
    </div>

    
    <Projects />
    </>
  );
}

export default App;