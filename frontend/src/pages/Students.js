import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPenTool, FiSearch, FiUserPlus } from "react-icons/fi";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Button,
  Form,
  FormGroup,
  Input,
  FormFeedback,
  Label,
} from "reactstrap";
import { Spinner } from "react-spinners";

const Students = () => {
  const [regNo, setRegNo] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState(false);
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateValue = (colName, val) => {
    setStudent({ ...student, [colName]: val });
    console.log(student);
  };

  const searchStudent = async (e) => {
    e.preventDefault();
    setSearching(true);
    setStudent({
      regNo: "B190703CS",
      name: "Muhammed Jaseem Pallikkal",
      email: "muhammedjaseem_b190703cs@nitc.ac.in",
      mobile: "7511135725",
    });
    // let res = await fetch(process.env.REACT_APP_API_URL + "/users/" + regNo, {
    //   headers: { "Content-Type": "application/json" },
    //   method: "GET",
    //   credentials: "include",
    //   body: JSON.stringify({
    //     reg_no: regNo,
    //   }),
    // });
    // if (res.ok) {
    //   let student = await res.json();
    //   console.log(student);
    //   setStudent(student);
    // } else {
    //   setErrorText(true);
    //   setStudent(null);
    // }
    setSearching(false);
    return;
  };

  const editStudent = async () => {
    setEditing(true);
    // let res = await fetch(process.env.REACT_APP_API_URL + "/users/" + regNo, {
    //   headers: { "Content-Type": "application/json" },
    //   method: "PUT",
    //   credentials: "include",
    //   body: JSON.stringify(student),
    // });
    // if (res.ok) {
    // } else {
    //   setErrorText(true);
    // }
    setEditing(false);
    return;
  };
  const deleteStudent = async () => {
    setDeleting(true);
    // let res = await fetch(process.env.REACT_APP_API_URL + "/users/" + regNo, {
    //   headers: { "Content-Type": "application/json" },
    //   method: "DELETE",
    //   credentials: "include",
    // });
    // if (res.ok) {
    // } else {
    //   setErrorText(true);
    // }
    setStudent(null);
    setDeleting(false);
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
      <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
        <Form className="col-12 col-md-3" onSubmit={searchStudent}>
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
              <Spinner size="25" />
            ) : (
              <Button className="btn btn-primary">
                <FiSearch size="25" />
              </Button>
            )}
          </FormGroup>
        </Form>
        {student && (
          <Form className="rounded card shadow pe-4 ps-4 pt-4 pb-2 col-12 col-md-4">
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                className="col-lg-6"
                type="text"
                value={student.name}
                placeholder="Full Name"
                onChange={(e) => {
                  updateValue("name", e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Reg. No.</Label>
              <Input
                className="col-lg-6"
                type="text"
                value={student.regNo}
                placeholder="Reg. No."
                readOnly
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                className="col-lg-6"
                type="email"
                value={student.email}
                placeholder="Reg. No. / Email"
                onChange={(e) => {
                  updateValue("email", e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Mobile No.</Label>
              <Input
                className="col-lg-6"
                type="number"
                value={student.mobile}
                placeholder="Mobile No."
                onChange={(e) => {
                  updateValue("mobile", e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup className="text-center pt-1">
              <Button className="btn btn-dark me-3" onClick={editStudent}>
                {editing ? (
                  <Spinner size="25" />
                ) : (
                  <MdEdit size="25" color="white" />
                )}
              </Button>
              <Button className="btn btn-danger" onClick={deleteStudent}>
                {deleting ? (
                  <Spinner size="25" />
                ) : (
                  <MdDelete size="25" color="white" />
                )}
              </Button>
            </FormGroup>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Students;
