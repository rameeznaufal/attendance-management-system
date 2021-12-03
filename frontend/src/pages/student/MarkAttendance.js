import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeatLoader } from "react-spinners";
import { Link } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { Button } from "reactstrap";

//This javascript file handles the marking of attendance by a student

const MarkAttendance = ({ user }) => {
  //Fetch and verify course
  //Fetch and store class
  //Check if already marked attendance
  //Mark Attendance
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [noPresent, setNoPresent] = useState(false);
  const [status, setStatus] = useState(2);

  var array = window.location.href.split("/");
  const cid = array[array.length - 4];
  const classid = array[array.length - 2];

  const handleAttendance = async (e) => {
    e.preventDefault();
    setMarking(true);
    let res = await fetch(process.env.REACT_APP_API_URL + "/attendance/mark", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        course_id: cid,
        class_id: classid,
        reg_no: user.reg_no,
        status: status,
      }),
    });
    if (res.ok) {
      navigate("/courses/" + cid);
      setMarking(false);
      return;
    } else {
      console.log("Error marking attendance");
      setMarking(false);
    }
    return;
  };

  useEffect(() => {
    setLoading(true);
    setMarked(false);
    if (!user || user.role !== "student") {
      navigate("/");
      return;
    }

    (async () => {
      let res = await fetch(
        process.env.REACT_APP_API_URL +
          "/attendance/courses/" +
          cid +
          "/classes/" +
          classid +
          "/students/" +
          user.reg_no,
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        console.log(res);
        var today = new Date();
        var class_date = new Date(res.class_date);
        today.setHours(0, 0, 0, 0);
        class_date.setHours(0, 0, 0, 0);
        if (res.attendance_status === 1 || res.attendance_status === 2) {
          setMarked(true);
          setLoading(false);
          return;
        }
        var curr_date = new Date();
        var utcYear = curr_date.getUTCFullYear();
        var utcMonth = curr_date.getUTCMonth() + 1;
        var utcDate = curr_date.getUTCDate();
        var utcHours = curr_date.getUTCHours();
        var utcMinutes = curr_date.getUTCMinutes();
        var utcSeconds = curr_date.getUTCSeconds();
        curr_date = new Date(
          utcYear +
            "-" +
            utcMonth +
            "-" +
            utcDate +
            " " +
            utcHours +
            ":" +
            utcMinutes +
            ":" +
            utcSeconds
        );
        var diff60 = 3600000; // 60 minutes
        var diff5 = 300000; //5 minutes
        var start_date = new Date(
          res.class_date.slice(0, 10) + " " + res.start_time
        );
        if (curr_date < start_date || curr_date - start_date > diff60) {
          navigate("/courses/" + cid);
          return;
        } else if (curr_date - start_date > diff5) {
          setNoPresent(true);
        }
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
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="">
          <div>
            <h5>
              <Link className="" to={"/courses/" + cid}>
                {cid}
              </Link>{" "}
              &#62; Mark Attendance
            </h5>
          </div>
          {marked ? (
            <h6 className="mt-4">Attendance already marked</h6>
          ) : (
            <form
              onSubmit={handleAttendance}
              className="shadow rounded mt-4 p-3"
            >
              <div className="text-center">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio1"
                    value="1"
                    disabled={noPresent}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                  ></input>
                  <label className="form-check-label" for="inlineRadio1">
                    Present
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio2"
                    value="2"
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                  ></input>
                  <label className="form-check-label" for="inlineRadio2">
                    Late
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio3"
                    value="0"
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                  ></input>
                  <label className="form-check-label" for="inlineRadio3">
                    Absent
                  </label>
                </div>
              </div>
              <div className="text-center mt-3">
                <Button
                  type="submit"
                  className="btn btn-dark"
                  style={{ width: 100, height: 40 }}
                >
                  {marking ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Mark"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
