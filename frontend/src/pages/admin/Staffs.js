//This javascript file handles the staff page for the admin

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Button,
  Form,
  FormGroup,
  Input,
  FormFeedback,
  Label,
} from "reactstrap";
import Spinner from "react-bootstrap/Spinner";

const Staffs = () => {
  const [staff_id, setStaff_id] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState(false);
  const [staff, setStaff] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateValue = (colName, val) => {
    setStaff({ ...staff, [colName]: val });
  };

  const searchStaff = async (e) => {
    e.preventDefault();
    setSearching(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/users/staffs/" + staff_id,
      {
        headers: { "Content-Type": "application/json" },
        method: "GET",
        credentials: "include",
      }
    );
    if (res.ok) {
      let staff = await res.json();
      console.log(staff);
      setStaff(staff);
    } else {
      setErrorText(true);
      setStaff(null);
    }
    setSearching(false);
    return;
  };

  const editStaff = async () => {
    setEditing(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/users/staffs/" + staff.staff_id,
      {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(staff),
      }
    );
    if (res.ok) {
    } else {
      console.log("Could not update");
    }
    setEditing(false);
    return;
  };
  const deleteStaff = async () => {
    setDeleting(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/users/staffs/" + staff.staff_id,
      {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
        credentials: "include",
      }
    );
    if (res.ok) {
    } else {
      console.log("Could not delete");
    }
    setStaff(null);
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
            &#62; Staffs
          </h5>
        </div>
        <Link className="btn btn-primary" to="/staffs/add">
          <FiUserPlus size="25" />
        </Link>
      </div>
      <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
        <Form className="col-12 col-md-3" onSubmit={searchStaff}>
          <FormGroup>
            <h5 className="text-center mb-3">Search for a staff</h5>
            <Input
              className="col-lg-6"
              type="text"
              value={staff_id}
              placeholder="Staff ID / Email"
              onChange={(e) => {
                setStaff_id(e.target.value);
                setErrorText(false);
              }}
              required
              invalid={errorText}
            ></Input>
            <FormFeedback invalid>Staff could not be found</FormFeedback>
          </FormGroup>
          <FormGroup className="text-center">
            <Button
              className="btn btn-primary"
              type="submit"
              style={{ width: 50, height: 40 }}
            >
              {searching ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <FiSearch size="25" />
              )}
            </Button>
          </FormGroup>
        </Form>
        {staff && (
          <Form className="rounded card shadow pe-4 ps-4 pt-4 pb-2 col-12 col-md-4">
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                className="col-lg-6"
                type="text"
                value={staff.name}
                placeholder="Full Name"
                onChange={(e) => {
                  updateValue("name", e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Staff ID</Label>
              <Input
                className="col-lg-6"
                type="text"
                value={staff.staff_id}
                placeholder="Reg. No."
                readOnly
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                className="col-lg-6"
                type="email"
                value={staff.email}
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
                value={staff.mobile}
                placeholder="Mobile No."
                onChange={(e) => {
                  updateValue("mobile", e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup className="text-center pt-1">
              <Button
                className="btn btn-dark"
                style={{ width: 50, height: 40 }}
                onClick={editStaff}
              >
                {editing ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <MdEdit size="25" color="white" />
                )}
              </Button>
              <Button
                className="btn btn-danger"
                style={{ width: 50, height: 40 }}
                onClick={deleteStaff}
              >
                {deleting ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
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

export default Staffs;
