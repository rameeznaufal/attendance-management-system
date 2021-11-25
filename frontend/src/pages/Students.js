import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { Button, Form, FormGroup, Input, FormFeedback } from "reactstrap";
import { Spinner } from "react-spinners";

const Students = () => {
  const [regNo, setRegNo] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState(false);
  const [student, setStudent] = useState(null);
  const searchStudent = async (e) => {
    e.preventDefault();
    setSearching(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/users/login", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        reg_no: regNo,
      }),
    });
    if (res.ok) {
      let student = await res.json();
      console.log(student);
      setStudent(student);
    } else {
      setErrorText(true);
      setStudent(null);
    }
    setSearching(false);
    return;
  };
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to="/">
              Home
            </Link>{" "}
            > Students
          </h5>
        </div>
        <Link className="btn btn-primary" to="/students/add">
          <FiUserPlus size="25" />
        </Link>
      </div>
      <div className="d-flex justify-content-center shadow rounded">
        <Form className=" p-4 col-md-5" onSubmit={searchStudent}>
          <FormGroup>
            <h5 className="text-center mb-3">Search for a student</h5>
            <Input
              className="col-lg-6"
              type="text"
              value={regNo}
              placeholder="Reg. No. / Email"
              onChange={(e) => {
                setRegNo(e.target.value);
                setErrorText(false);
              }}
              required
              invalid={errorText}
            ></Input>
            <FormFeedback invalid>Student could not be found</FormFeedback>
          </FormGroup>
          <FormGroup className="text-center">
            {searching ? (
              <Spinner />
            ) : (
              <Button className="btn btn-primary">
                <FiSearch size="25" />
              </Button>
            )}
          </FormGroup>
        </Form>
      </div>
    </div>
  );
};

export default Students;
