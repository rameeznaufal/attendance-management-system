import React, { useState } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import { Link } from "react-router-dom";
import logo from "../background/logo.png";
import AdminHome from "./users/AdminHome.js";
import StaffHome from "./users/StaffHome.js";
import StudentHome from "./users/StudentHome.js";

const Home = ({ user, setUser }) => {
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
      let us = await res.json();
      console.log(us);
      // res = await fetch(
      //   process.env.REACT_APP_API_URL + "/users/" + us.id + "/notes",
      //   {
      //     headers: { "Content-Type": "application/json" },
      //     credentials: "include",
      //   }
      // );
      // if (res.ok) {
      //   res = await res.json();
      //   res.map((obj) => {
      //     notes.push({
      //       server_id: obj[0],
      //       client_id: uuid(),
      //       user_id: obj[1],
      //       title: obj[2],
      //       note: obj[3],
      //       last_edited: obj[4],
      //       tags: obj[5]
      //     });
      //   });
      // }
      setUser(us);
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
    else if (user.role === "student") return <StudentHome />;
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
