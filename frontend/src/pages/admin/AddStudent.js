import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";


//This javascript file consists of functions relating to adding a student by admin
const AddStudent = ({ user }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reg_no, setReg_no] = useState("");
  const [mobile, setMobile] = useState("");
  const [adding, setAdding] = useState(false);

  const addStudent = async (e) => {
    e.preventDefault();
    setAdding(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/users/students/", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        name: name,
        email: email,
        mobile: mobile,
        reg_no: reg_no,
      }),
    });
    if (res.ok) {
    } else {
      console.log("Could not add");
    }
    setAdding(false);
  };
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to="/">
              Home
            </Link>{" "}
            &#62;{" "}
            <Link className="" to="/students">
              Students
            </Link>
            &#62; Add
          </h5>
        </div>
      </div>
      <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
        <Form className="col-12 col-md-4" onSubmit={addStudent}>
          <FormGroup>
            <Label>Full Name</Label>
            <Input
              className="col-lg-6"
              type="text"
              value={name}
              placeholder="Full Name"
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
            ></Input>
          </FormGroup>
          <FormGroup>
            <Label>Reg. No.</Label>
            <Input
              className="col-lg-6"
              type="text"
              value={reg_no}
              onChange={(e) => {
                setReg_no(e.target.value);
              }}
              placeholder="Reg. No."
              required
            ></Input>
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              className="col-lg-6"
              type="email"
              value={email}
              placeholder="Reg. No. / Email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            ></Input>
          </FormGroup>
          <FormGroup>
            <Label>Mobile No.</Label>
            <Input
              className="col-lg-6"
              type="number"
              value={mobile}
              placeholder="Mobile No."
              onChange={(e) => {
                setMobile(e.target.value);
              }}
              required
            ></Input>
          </FormGroup>
          <FormGroup className="text-center pt-1">
            <Button
              type="submit"
              className="btn btn-dark"
              style={{ width: 100, height: 40 }}
            >
              {adding ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Add"
              )}
            </Button>
          </FormGroup>
        </Form>
      </div>
    </div>
  );
};

export default AddStudent;
