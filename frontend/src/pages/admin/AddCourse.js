import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";


//This javascript file consists of functions relating to adding a course by admin
const AddCourse = ({ user }) => {
  const [course_name, setCourse_name] = useState("");
  const [course_id, setCourse_id] = useState("");
  const [adding, setAdding] = useState(false);

  const addCourse = async (e) => {
    e.preventDefault();
    setAdding(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/courses/", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        course_name: course_name,
        course_id: course_id,
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
            <Link className="" to="/courses">
              Courses
            </Link>
            &#62; Add
          </h5>
        </div>
      </div>
      <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
        <Form className="col-12 col-md-4" onSubmit={addCourse}>
          <FormGroup>
            <Label>Course Name</Label>
            <Input
              className="col-lg-6"
              type="text"
              value={course_name}
              placeholder="Course Name"
              onChange={(e) => {
                setCourse_name(e.target.value);
              }}
              required
            ></Input>
          </FormGroup>
          <FormGroup>
            <Label>Course ID</Label>
            <Input
              className="col-lg-6"
              type="text"
              value={course_id}
              onChange={(e) => {
                setCourse_id(e.target.value);
              }}
              placeholder="Course ID"
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

export default AddCourse;
