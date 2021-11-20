import React, { useState } from "react";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import guy from "../background/guy.svg";
import bgmobile from "../background/bgmobile.svg";
import { Modal } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner'
import { Link } from 'react-router-dom';
import uuid from "react-uuid";

const Home = ({ notes, setUser }) => {
  const [loginModalShow, setLoginModalShow] = useState(false);
  const [signupModalShow, setSignupModalShow] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const [signing, setSigning] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleClose = () => {
    setLoginModalShow(false);
    setSignupModalShow(false);
    setEmail("");
    setName("");
    setPassword("");
    setErrorText("");
  }
  const handleLogin = async () => {
    if (!email) {
      setErrorText("Enter Email ID");
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
        email: email,
        password: password
      })
    });
    if (res.ok) {
      let us = await res.json();
      res = await fetch(
        process.env.REACT_APP_API_URL + "/users/" + us.id + "/notes",
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        res.map((obj) => {
          notes.push({
            server_id: obj[0],
            client_id: uuid(),
            user_id: obj[1],
            title: obj[2],
            note: obj[3],
            last_edited: obj[4],
            tags: obj[5]
          });
        });
      }
      setUser(us);
      setLoginModalShow(false);
    } else {
      if (res.status === 401) {
        setErrorText("Invalid Email or Password");
      }
      setUser(null);
    }
    setLogging(false);
  };
  const handleSignUp = async () => {
    if (!name) {
      setErrorText("Enter Name");
      return;
    }
    if (!email) {
      setErrorText("Enter Email ID");
      return;
    }
    if (!password) {
      setErrorText("Enter Password");
      return;
    }
    setSigning(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/users/signup", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: 'include',
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      })
    });
    if (res.ok) {
      res = await res.json();
      setUser(res);
      setSignupModalShow(false);
    } else {
      if (res.status === 409) {
        setErrorText("Email ID already exists");
      }
      setUser(null);
    }
    setSigning(false);
  };

  return (
    <div>
      <div className="d-flex hero-text">
        <div className="lex-shrink-1 hero-text">
          <h1>Web App to manage attendance</h1>
          <div>

            <div className="mt-4">
              <small>
                Developed as part of <Link to="https://github.com/rameeznaufal/attendance-management-system">DBMS final project</Link>
              </small>
            </div>
          </div>
        </div>
        <div className="pt-4 w-100">
          <img className="guy" src={guy} alt="background" />
        </div>
      </div>
      <img className="bgmobile ps-5" src={bgmobile} alt="background" />
      <Modal
        show={loginModalShow}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Title>
          <h2 className="text-center pt-3">Log in</h2>
        </Modal.Title>
        <Modal.Body>
          <div className="pe-5 ps-5">
            <Form className="login-form">
              <FormGroup>
                <Label className="mb-1">Email ID</Label>
                <Input
                  className="mb-3"
                  type="text"
                  value={email}
                  placeholder="Email ID"
                  onChange={(e) => { setErrorText(" "); setEmail(e.target.value) }}
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
                <span className="mb-1 text-danger">{errorText}</span>
              </FormGroup>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-success"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            style={{ width: 80 }}
            className="btn btn-primary"
            onClick={handleLogin}
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
              "Login"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={signupModalShow}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Title>
          <h2 className="text-center pt-3">Sign Up</h2>
        </Modal.Title>
        <Modal.Body>
          <div className="pe-5 ps-5">
            <Form className="login-form">
              <FormGroup>
                <Label className="mb-1">Name</Label>
                <Input
                  className="mb-3"
                  type="text"
                  value={name}
                  placeholder="Name"
                  onChange={(e) => { setErrorText(" "); setName(e.target.value) }}
                ></Input>
              </FormGroup>
              <FormGroup>
                <Label className="mb-1">Email ID</Label>
                <Input
                  className="mb-3"
                  type="text"
                  value={email}
                  placeholder="Email ID"
                  onChange={(e) => { setErrorText(" "); setEmail(e.target.value) }}
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
                <span className="mb-1 text-danger">{errorText}</span>
              </FormGroup>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-success"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            style={{ width: 80 }}
            className="btn btn-primary"
            onClick={handleSignUp}
          >
            {signing ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Sign up"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Home;
