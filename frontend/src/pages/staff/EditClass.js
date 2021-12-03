import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import { BeatLoader } from "react-spinners";
import { MdEdit, MdDelete } from "react-icons/md";


//This javascript file consists of functions relating to editing a class by staff
const EditClass = ({ user }) => {
  const [classDate, setClassDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [slot, setSlot] = useState(0);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  var array = window.location.href.split("/");
  var cid = array[array.length - 4];
  var classid = array[array.length - 2];

  const editClass = async (e) => {
    e.preventDefault();
    setEditing(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/classes/" + classid + "/course/" + cid,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "PUT",
        body: JSON.stringify({
          course_id: cid,
          class_date: classDate + " 00:00:00",
          slot_id: slot,
        }),
      }
    );
    if (res.ok) {
      setEditing(false);
      return;
    } else {
      console.log("Error Editing Class");
    }
    setEditing(false);
    return;
  };

  const deleteClass = async (e) => {
    e.preventDefault();
    setDeleting(true);
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/classes/" + classid + "/course/" + cid,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "DELETE",
      }
    );
    if (res.ok) {
      navigate("/courses/" + cid);
      setEditing(false);
      return;
    } else {
      console.log("Error Deleting Class");
    }
    setEditing(false);
    return;
  };

  const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  useEffect(() => {
    setLoading(true);
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }

    (async () => {
      let res = await fetch(
        process.env.REACT_APP_API_URL +
          "/classes/" +
          classid +
          "/course/" +
          cid,
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        setClassDate(formatDate(res.class_date));
        setSlot(res.slot_id);
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [cid, classid]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to={"/courses/" + cid}>
              {cid}
            </Link>{" "}
            &#62; Edit Class
          </h5>
        </div>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
          <Form className="col-12 col-md-4">
            <FormGroup>
              <Label>Date</Label>
              <Input
                className="col-lg-6"
                type="date"
                value={classDate}
                onChange={(e) => {
                  setClassDate(e.target.value);
                }}
                required
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Slot</Label>
              <select
                class="form-select"
                aria-label="Slot selection"
                onChange={(e) => {
                  setSlot(e.target.value);
                }}
              >
                <option value="1" selected={slot === 1 && "true"}>
                  A (8 AM - 9 AM)
                </option>
                <option value="2" selected={slot === 2 && "true"}>
                  B (9 AM - 10 AM)
                </option>
                <option value="3" selected={slot === 3 && "true"}>
                  C (10:15 AM - 11:15 AM)
                </option>
                <option value="4" selected={slot === 4 && "true"}>
                  D (11:15 AM - 12: 15 PM)
                </option>
                <option value="5" selected={slot === 5 && "true"}>
                  E (2 PM - 5 PM)
                </option>
              </select>
            </FormGroup>
            <FormGroup className="text-center pt-1">
              <Button
                onClick={editClass}
                className="btn btn-dark me-3"
                style={{ width: 50, height: 40 }}
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
                  <MdEdit size="25" />
                )}
              </Button>
              <Button
                onClick={deleteClass}
                className="btn btn-danger"
                style={{ width: 50, height: 40 }}
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
                  <MdDelete color="white" size="25" />
                )}
              </Button>
            </FormGroup>
          </Form>
        </div>
      )}
    </div>
  );
};

export default EditClass;
