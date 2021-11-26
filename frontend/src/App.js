import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.js";
import Students from "./pages/Students.js";
import AddStudent from "./pages/AddStudent.js";
import Staffs from "./pages/Staffs.js";
import AddStaff from "./pages/AddStaff.js";
import NavbarTop from "./components/NavbarTop.js";
import "./custom.scss";

function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogOut = async () => {
    setUser(null);
    await fetch(process.env.REACT_APP_API_URL + "/users/logout", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      method: "POST",
    });
  };

  useEffect(() => {
    setLoading(false);
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
        <div className="container pt-4">
          <Routes>
            <Route
              path="/"
              exact
              element={<Home user={user} setUser={setUser} />}
            />
            <Route path="/students" exact element={<Students user={user} />} />
            <Route
              path="/students/add"
              exact
              element={<AddStudent user={user} />}
            />
            <Route path="/staffs" exact element={<Staffs user={user} />} />
            <Route
              path="/staffs/add"
              exact
              element={<AddStaff user={user} />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
