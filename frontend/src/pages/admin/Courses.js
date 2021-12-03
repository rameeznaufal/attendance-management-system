//This javascript file handles the course page for the admin

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFolderPlus } from "react-icons/fi";
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
import Select from "react-select";
import { BeatLoader } from "react-spinners";

const Courses = () => {
  const [course_id, setCourse_id] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState(false);
  const [course, setCourse] = useState(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState();
  const [currentStaffs, setCurrentStaffs] = useState([]);
  const [selectedStaffs, setSelectedStaffs] = useState([]);

  const updateValue = (colName, val) => {
    setCourse({ ...course, [colName]: val });
  };

  const searchCourse = async (e) => {
    e.preventDefault();
    setSearching(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/courses/" + course_id,
      {
        headers: { "Content-Type": "application/json" },
        method: "GET",
        credentials: "include",
      }
    );
    if (res.ok) {
      res = await res.json();
      let i;
      let currentStaffs_copy = [];
      for (i in res.staffs) {
        currentStaffs_copy.push({
          value: res.staffs[i]["staff_id"],
          label: res.staffs[i]["staff_name"],
        });
      }
      setCurrentStaffs(currentStaffs_copy);
      setSelectedStaffs(currentStaffs_copy);
      setCourse(res);
    } else {
      setCurrentStaffs([]);
      setErrorText(true);
      setCourse(null);
    }
    setSearching(false);
    return;
  };

  const editCourse = async () => {
    setEditing(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/courses/" + course.course_id,
      {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({
          course_name: course.course_name,
          staffs: selectedStaffs,
        }),
      }
    );
    if (res.ok) {
    } else {
      console.log("Could not update");
    }
    setEditing(false);
    return;
  };
  const deleteCourse = async () => {
    setDeleting(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/courses/" + course.course_id,
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
    setCourse(null);
    setDeleting(false);
    return;
  };
  const handleStaffChange = (selectedOptions) => {
    setSelectedStaffs(selectedOptions);
    return;
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      let res = await fetch(process.env.REACT_APP_API_URL + "/users/staffs", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        res = await res.json();
        let i;
        let staffs_copy = [];
        for (i in res) {
          staffs_copy.push({
            value: res[i]["staff_id"],
            label: res[i]["name"],
          });
        }
        setStaffs(staffs_copy);
      } else {
        console.log("Error fetching staffs");
        staffs = [];
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to="/">
              Home
            </Link>{" "}
            &#62; Courses
          </h5>
        </div>
        <Link className="btn btn-primary" to="/courses/add">
          <FiFolderPlus size="25" />
        </Link>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
          <Form className="col-12 col-md-3" onSubmit={searchCourse}>
            <FormGroup>
              <h5 className="text-center mb-3">Search for a course</h5>
              <Input
                className="col-lg-6"
                type="text"
                value={course_id}
                placeholder="Course ID / Course Name"
                onChange={(e) => {
                  setCourse_id(e.target.value);
                  setErrorText(false);
                }}
                required
                invalid={errorText}
              ></Input>
              <FormFeedback invalid>Course could not be found</FormFeedback>
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
          {course && (
            <Form className="rounded card shadow pe-4 ps-4 pt-4 pb-2 col-12 col-md-4">
              <FormGroup>
                <Label>Course Name</Label>
                <Input
                  className="col-lg-6"
                  type="text"
                  value={course.course_name}
                  placeholder="Course Name"
                  onChange={(e) => {
                    updateValue("course_name", e.target.value);
                  }}
                  required
                ></Input>
              </FormGroup>
              <FormGroup>
                <Label>Course ID</Label>
                <Input
                  className="col-lg-6"
                  type="text"
                  value={course.course_id}
                  placeholder="Course ID"
                  readOnly
                ></Input>
              </FormGroup>
              <FormGroup>
                <Label>Staffs</Label>
                <Select
                  defaultValue={currentStaffs}
                  isMulti
                  name="staffs"
                  options={staffs}
                  onChange={handleStaffChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </FormGroup>
              <FormGroup className="text-center pt-1">
                <Button
                  className="btn btn-dark"
                  style={{ width: 50, height: 40 }}
                  onClick={editCourse}
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
                  onClick={deleteCourse}
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
      )}
    </div>
  );
};

export default Courses;
