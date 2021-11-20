import React, { useState } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import guy from "../background/guy.svg";
import bgmobile from "../background/bgmobile.svg";
import { Modal } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner'
import { Link } from 'react-router-dom';
import uuid from "react-uuid";

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
      credentials: 'include',
      body: JSON.stringify({
        reg_no: regNo,
        password: password
      })
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
      }
      setUser(null);
    }
    setLogging(false);
  };

  return (
    <div className="pt-4">
      {
        user ?
          <h1>Logged in as {user.role}</h1>
          : <>
            <h1 className="w-50">Web App to Manage Attendance</h1>
            <Form className="pt-4 w-25" onSubmit={handleLogin}>
              <FormGroup>
                <Label className="mb-1">Registration Number / Email ID</Label>
                <Input
                  className="mb-3"
                  type="text"
                  value={regNo}
                  placeholder="Reg. No. / Email"
                  onChange={(e) => { setErrorText(" "); setRegNo(e.target.value) }}
                ></Input>
              </FormGroup>
              <FormGroup>
                <Label className="mb-1">Password</Label>
                <Input
                  className="mb-3"
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => { setErrorText(" "); setPassword(e.target.value) }}
                ></Input>
              </FormGroup>
              <FormGroup>
                <Button className="btn btn-md btn-primary">
                  Log In
                </Button>
              </FormGroup>
              <FormGroup>
                <span className="mb-1 text-danger">{errorText}</span>
              </FormGroup>
            </Form>
            <div className="pt-4">
              <small>
                Developed as part of <Link to="https://github.com/rameeznaufal/attendance-management-system">DBMS final project</Link>
              </small>
            </div>
          </>}

    </div>
  );
}

export default Home;
