import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { BeatLoader } from "react-spinners";
import uuid from "react-uuid";
import Home from "./pages/Home.js";
// import Sidebar from "./components/Sidebar";
// import Notes from "./components/Note.js";
import NavbarTop from "./components/NavbarTop.js";
import "./custom.scss";

function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState("");

  const handleLogOut = async () => {
    setUser(null);
    await fetch(
      process.env.REACT_APP_API_URL +
      "/users/logout",
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "POST",
      }
    );
  };

  useEffect(() => {
  (async () => {
    let res = await fetch(process.env.REACT_APP_API_URL + "/users/verify", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      res = await res.json();
      setUser(res);
    } else {
      setUser(null);
    }
    setLoading(true);
  })();
  }, []);

  return (
    <div>
      <BrowserRouter>
        <NavbarTop user={user} handleLogOut={handleLogOut} />
        <div className="container" >
          <Routes>
            <Route
              path="/"
              exact
              element={<Home user={user} setUser={setUser} />}
            />
            {/* <Route
              path="/login"
              exact
              element={<Login user={user} />}
            />
            <Route
              path="/profile"
              exact
              element={<Profile user={user} />}
            />
            <Route
              path="/add"
              exact
              element={<AddSwag user={user} />}
            /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
