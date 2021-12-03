import React, { useState } from "react";
import { Button, Form, FormGroup, Input, FormFeedback } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router";

//This javascript file handles the home page of a student

const StudentHome = ({ user, courses, setCourses }) => {
  const [enrolling, setEnrolling] = useState(false);
  const [courseID, setCourseID] = useState("");
  const [invalidEnroll, setInvalidEnroll] = useState(false);
  const navigate = useNavigate();

  const enrollCourse = async (e) => {
    e.preventDefault();
    // return;
    setEnrolling(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL +
        "/users/student/" +
        user.reg_no +
        "/courses/" +
        courseID +
        "/enroll",
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          course_id: courseID,
        }),
      }
    );
    if (res.ok) {
      res = await res.json();
      console.log(res);
      setCourses((prevValue) => [
        ...prevValue,
        {
          course_id: courseID,
          course_name: res.course_name,
        },
      ]);
      navigate("/courses/" + courseID);
    } else {
      setInvalidEnroll(true);
      console.log("Could not enroll");
    }
    setEnrolling(false);
  };

  return (
    <div className="d-flex w-100 justify-content-between align-items-center mb-3">
      <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3">
        <Form className="col-12 col-md-3" onSubmit={enrollCourse}>
          <FormGroup>
            <h5 className="text-center">Enroll in a course</h5>
            <Input
              className="col-lg-6"
              type="text"
              value={courseID}
              placeholder="Course ID"
              onChange={(e) => {
                setInvalidEnroll(false);
                setCourseID(e.target.value);
              }}
              required
              invalid={invalidEnroll}
            ></Input>
            <FormFeedback invalid>
              Invalid course ID or you are already enrolled
            </FormFeedback>
          </FormGroup>
          <FormGroup className="text-center pt-1">
            <Button
              className="btn btn-dark"
              style={{ width: 70, height: 40 }}
              type="submit"
            >
              {enrolling ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Enroll"
              )}
            </Button>
          </FormGroup>
        </Form>
      </div>
    </div>
  );
};

export default StudentHome;
