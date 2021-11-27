import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.js";
import Students from "./pages/admin/Students.js";
import AddStudent from "./pages/admin/AddStudent.js";
import Staffs from "./pages/admin/Staffs.js";
import AddStaff from "./pages/admin/AddStaff.js";
import Courses from "./pages/admin/Courses.js";
import AddCourse from "./pages/admin/AddCourse.js"
import { BeatLoader } from "react-spinners";

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
    });
  };

  useEffect(() => {
    setLoading(true);
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
      setLoading(false);
    })();
  }, []);

  return (
    <div>{loading ?
      <div className="container text-center mt-5">
            <BeatLoader loading />
          </div>
      :
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
            <Route path="/courses" exact element={<Courses user={user} />} />
            <Route
              path="/courses/add"
              exact
              element={<AddCourse user={user} />}
            />
          </Routes>
        </div>
      </BrowserRouter>}
    </div>
  );
}

export default App;
