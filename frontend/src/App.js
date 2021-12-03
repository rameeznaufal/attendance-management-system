import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.js";
import Students from "./pages/admin/Students.js";
import AddStudent from "./pages/admin/AddStudent.js";
import Staffs from "./pages/admin/Staffs.js";
import AddStaff from "./pages/admin/AddStaff.js";
import Courses from "./pages/admin/Courses.js";
import AddCourse from "./pages/admin/AddCourse.js";
import Course from "./pages/Course.js";
import AddClass from "./pages/staff/AddClass.js";
import EditClass from "./pages/staff/EditClass.js";
import MarkAttendance from "./pages/student/MarkAttendance.js";
import AttendanceStat from "./pages/StudentStatistics.js";
import StudentsEnrolled from "./pages/staff/StudentsEnrolled.js";
import ClassStatistics from "./pages/staff/ClassStatistics.js";
import StudentStatistics from "./pages/StudentStatistics.js";
import { BeatLoader } from "react-spinners";
import NavbarTop from "./components/NavbarTop.js";
import "./custom.scss";

function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);

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
        if (res.role === "student" || res.role === "staff") {
          let res_course = await fetch(
            process.env.REACT_APP_API_URL +
              "/users/" +
              res.role +
              "/" +
              res.reg_no +
              "/courses",
            {
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          res_course = await res_course.json();
          setCourses(res_course);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <Router>
          <NavbarTop user={user} setUser={setUser} courses={courses} />
          <div className="container pt-4">
            <Routes>
              <Route
                path="/"
                exact
                element={
                  <Home
                    user={user}
                    setUser={setUser}
                    courses={courses}
                    setCourses={setCourses}
                  />
                }
              />
              <Route
                path="/students"
                exact
                element={<Students user={user} />}
              />
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
              <Route
                path="/courses/add"
                exact
                element={<AddCourse user={user} />}
              />
              <Route
                path="/courses/:course_id/classes/:class_id/mark"
                exact
                element={<MarkAttendance user={user} />}
              />
              <Route
                path="/courses/:id/add"
                exact
                element={<AddClass user={user} />}
              />
              <Route
                path="/courses/:id/students"
                exact
                element={<StudentsEnrolled user={user} />}
              />
              <Route
                path="/courses/:id/students/:reg_no"
                exact
                element={<AttendanceStat user={user} />}
              />
              <Route
                path="/courses/:cid/classes/:classid/edit"
                exact
                element={<EditClass user={user} />}
              />
              <Route
                path="/courses/:id"
                exact
                element={<Course user={user} />}
              />
              <Route
                path="/courses/:courseid/classes/:classid"
                exact
                element={<ClassStatistics user={user} />}
              />
              <Route
                path="/courses/:courseid/classes/:classid/students/:reg_no"
                exact
                element={<StudentStatistics user={user} />}
              />
              <Route path="/courses" exact element={<Courses user={user} />} />
            </Routes>
          </div>
        </Router>
      )}
    </div>
  );
}

export default App;
