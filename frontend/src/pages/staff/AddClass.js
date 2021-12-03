import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import { BeatLoader } from "react-spinners";


//This javascript file consists of functions relating to adding a class by staff
const AddClass = ({ user }) => {
  const [classDate, setClassDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [slot, setSlot] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseID, setCourseID] = useState("");
  const navigate = useNavigate();

  const addClass = async (e) => {
    e.preventDefault();
    setAdding(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/classes/add", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({
        course_id: courseID,
        class_date: classDate + " 00:00:00",
        slot_id: slot,
      }),
    });
    if (res.ok) {
      navigate("/courses/" + courseID);
      return;
    } else {
      console.log("Error Adding Class");
    }
    setAdding(false);
    return;
  };

  useEffect(() => {
    setLoading(true);
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }
    var array = window.location.href.split("/");
    setCourseID(array[array.length - 2]);

    (async () => {
      let res = await fetch(
        process.env.REACT_APP_API_URL + "/courses/" + array[array.length - 2],
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to={"/courses/" + courseID}>
              {courseID}
            </Link>{" "}
            &#62; Add Class
          </h5>
        </div>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
          <Form className="col-12 col-md-4" onSubmit={addClass}>
            <FormGroup>
              <Label>Date</Label>
              <Input
                className="col-lg-6"
                type="date"
                value={classDate}
                onChange={(e) => {
                  console.log(e.target.value);
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
                <option selected value="1">
                  A (8 AM - 9 AM)
                </option>
                <option value="2">B (9 AM - 10 AM)</option>
                <option value="3">C (10:15 AM - 11:15 AM)</option>
                <option value="4">D (11:15 AM - 12: 15 PM)</option>
                <option value="5">E (2 PM - 5 PM)</option>
              </select>
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
      )}
    </div>
  );
};

export default AddClass;
