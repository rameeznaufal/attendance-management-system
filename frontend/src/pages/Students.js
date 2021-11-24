import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { Button, Form, FormGroup, Input } from "reactstrap";

const Students = () => {
  const [regNo, setRegNo] = useState("");

  const searchStudent = async (e) => {
    e.preventDefault();
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
      <div className="d-flex justify-content-center">
        <Form
          className="shadow p-4 rounded col-md-3 col-lg-4 "
          onSubmit={searchStudent}
        >
          <FormGroup>
            <h5 className="text-center mb-3">Search for a student</h5>
            <Input
              className="mb-3"
              type="text"
              value={regNo}
              placeholder="Reg. No. / Email"
              onChange={(e) => {
                setRegNo(e.target.value);
              }}
              required
            ></Input>
          </FormGroup>
          <FormGroup className="text-center">
              <Button className="btn btn-primary">
              <FiSearch size="25" />
          </Button>
          </FormGroup>
        </Form>
      </div>
    </div>
  );
};

export default Students;
