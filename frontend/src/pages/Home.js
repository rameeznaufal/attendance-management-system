import React, { useState } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import logo from "../background/logo.png";
import AdminHome from "./admin/AdminHome.js";
import StaffHome from "./staff/StaffHome.js";
import StudentHome from "./student/StudentHome.js";


//This is a common js file for all types of users to deal with their respective home screens
const Home = ({ user, setUser, courses, setCourses }) => {
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!regNo) {
      setErrorText("Enter Registration Number or Email");
      return;
    }
    if (!password) {
      setErrorText("Enter Password");
      return;
    }
    setLogging(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/users/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        reg_no: regNo,
        password: password,
      }),
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
      }
    } else {
      if (res.status === 401) {
        setErrorText("Invalid Email or Password");
      } else {
        setErrorText("Something went wrong!");
      }
      setUser(null);
    }
    setLogging(false);
  };

  if (user && user.role) {
    if (user.role === "admin") return <AdminHome />;
    else if (user.role === "staff") return <StaffHome />;
    else if (user.role === "student")
      return (
        <StudentHome user={user} courses={courses} setCourses={setCourses} />
      );
  } else {
    return (
      <div className="pt-4">
        <div className="w-100 d-flex justify-content-between flex-md-row flex-column">
          <div>
            <h1>Manage Attendance</h1>
            <Form
              className="w-100 mt-4 shadow pt-4 ps-4 pe-4 pb-2 rounded"
              onSubmit={handleLogin}
            >
              <FormGroup>
                <Label className="mb-1">Registration Number / Email ID</Label>
                <Input
                  className="mb-3"
                  type="text"
                  value={regNo}
                  placeholder="Reg. No. / Email"
                  onChange={(e) => {
                    setErrorText(" ");
                    setRegNo(e.target.value);
                  }}
                ></Input>
              </FormGroup>
              <FormGroup>
                <Label className="mb-1">Password</Label>
                <Input
                  className="mb-3"
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => {
                    setErrorText(" ");
                    setPassword(e.target.value);
                  }}
                ></Input>
              </FormGroup>
              <FormGroup className="text-center">
                <Button
                  style={{ width: 100 }}
                  className="btn btn-md btn-grey mt-2"
                >
                  {logging ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Log In"
                  )}
                </Button>
              </FormGroup>
              <FormGroup className="text-center">
                {errorText !== "" && (
                  <div className="pb-2">
                    <span className="text-danger">{errorText}</span>
                  </div>
                )}
                <div>
                  <Link to="/forgot-password">Forgot Password</Link>
                </div>
              </FormGroup>
            </Form>
            <div className="pt-4">
              <h6>
                Developed as part of{" "}
                <Link to="https://github.com/rameeznaufal/attendance-management-system">
                  DBMS final project
                </Link>
              </h6>
            </div>
          </div>
          <img src={logo} alt="AMS Logo" className="logo"></img>
        </div>
      </div>
    );
  }
};

export default Home;
