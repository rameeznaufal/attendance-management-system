import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { BeatLoader } from "react-spinners";

//This js file is a common file for both staff and student that handles the classes relating to courses
const Course = ({ user }) => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [previousClasses, setPreviousClasses] = useState([]);
  const [courseID, setCourseID] = useState("");
  const [loading, setLoading] = useState(true);

  const statusArray = ["Absent", "Present", "Late"];

  var array = window.location.href.split("/");
  var cid = array[array.length - 1];

  const staffsString = () => {
    let staffsArray = [];
    for (let staff in course.staffs) {
      staffsArray.push(course.staffs[staff].staff_name);
    }
    return staffsArray.join(", ");
  };

  const sortClasses = (classes) => {
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
    // curr_date = new Date("2021-11-29 05:52:01");
    var diff = 3600000;
    for (let c in classes) {
      var start_date = new Date(
        classes[c].class_date.slice(0, 10) + " " + classes[c].start_time
      );
      if (curr_date < start_date) {
        setUpcomingClasses((prevValue) => [...prevValue, classes[c]]);
      } else if (curr_date - start_date > diff) {
        setPreviousClasses((prevValue) => [...prevValue, classes[c]]);
      } else {
        setOngoingClasses((prevValue) => [...prevValue, classes[c]]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setOngoingClasses((prevValue) => []);
    setUpcomingClasses((prevValue) => []);
    setPreviousClasses((prevValue) => []);
    if (!user || (user.role !== "student" && user.role !== "staff")) {
      navigate("/");
      return;
    }
    setCourseID(cid);
    (async () => {
      let res = await fetch(process.env.REACT_APP_API_URL + "/courses/" + cid, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        res = await res.json();
        setCourse(res);
        var apiString =
          process.env.REACT_APP_API_URL + "/courses/" + cid + "/classes";
        if (user.role === "student")
          apiString = apiString + "/student/" + user.reg_no;
        let res2 = await fetch(apiString, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res2.ok) {
          res2 = await res2.json();
          sortClasses(res2);
        } else {
          console.log("error loading classes");
          setLoading(false);
        }
      } else {
        setCourse(null);
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [cid]);

  const getAMPM = (t) => {
    var hours = t.getHours();
    var minutes = t.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const displayDate = (d) => {
    d = new Date(d);
    return d.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const displayTime = (d, t1, t2) => {
    var d = new Date(d);
    var st = new Date(
      d.getFullYear() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getDate() +
        " " +
        t1 +
        " UTC"
    );
    var et = new Date(
      d.getFullYear() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getDate() +
        " " +
        t2 +
        " UTC"
    );
    return getAMPM(st) + " - " + getAMPM(et);
  };

  const goToClass = (class_id) => {
    navigate("/courses/" + cid + "/classes/" + class_id);
    return;
  };

  return (
    <div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        course && (
          <div>
            <h2>
              {course.course_name} ({course.course_id})
            </h2>
            <p>
              Teacher
              {course && course.staffs && course.staffs.length > 1 && "s"}:{" "}
              {course && staffsString(course.staffs)}
            </p>
            <hr></hr>
            {user && user.role === "staff" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Link
                    className="btn btn-primary"
                    to={"/courses/" + courseID + "/students"}
                  >
                    Manage Students
                  </Link>
                  <Link
                    className="btn btn-primary"
                    to={"/courses/" + courseID + "/add"}
                  >
                    Add Class
                  </Link>
                </div>
                <hr></hr>
              </div>
            )}
            {ongoingClasses.length > 0 && (
              <div className="">
                <h6>ONGOING CLASSES</h6>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Class</th>
                      <th scope="col">Date &#38; Time</th>
                      {user && user.role === "staff" && <th scope="col"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {ongoingClasses.map((c) => {
                      return (
                        <tr
                          className="align-items-center"
                          // {onClick={() => user.role === "staff" && goToClass(c.class_id)}}
                        >
                          <td>{c.class_id}</td>
                          <td>
                            {displayDate(c.class_date)}
                            <br></br>
                            {displayTime(
                              c.class_date,
                              c.start_time,
                              c.end_time
                            )}
                          </td>
                          <td>
                            {user &&
                              user.role === "student" &&
                              (c.status === 0 ? (
                                <Link
                                  to={
                                    "/courses/" +
                                    cid +
                                    "/classes/" +
                                    c.class_id +
                                    "/mark"
                                  }
                                >
                                  Mark Attendance
                                </Link>
                              ) : (
                                statusArray[c.status]
                              ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {upcomingClasses.length > 0 && (
              <div className="mt-4">
                <h6>UPCOMING CLASSES</h6>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Class</th>
                      <th scope="col">Date &#38; Time</th>
                      {user && user.role === "staff" && <th scope="col"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingClasses.map((c) => {
                      return (
                        <tr className="align-items-center">
                          <td>{c.class_id}</td>
                          <td>
                            {displayDate(c.class_date)}
                            <br></br>
                            {displayTime(
                              c.class_date,
                              c.start_time,
                              c.end_time
                            )}
                          </td>
                          <td>
                            {user && user.role === "staff" && (
                              <Link
                                to={
                                  "/courses/" +
                                  cid +
                                  "/classes/" +
                                  c.class_id +
                                  "/edit"
                                }
                              >
                                Edit
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {previousClasses.length > 0 && (
              <div className="mt-4">
                <h6>PREVIOUS CLASSES</h6>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Class</th>
                      <th scope="col">Date &#38; Time</th>
                      {user && user.role === "student" && (
                        <th scope="col">Status</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previousClasses.map((c) => {
                      return (
                        <tr
                          className="align-items-center"
                          onClick={() => goToClass(c.class_id)}
                        >
                          <td>{c.class_id}</td>
                          <td>
                            {displayDate(c.class_date)}
                            <br></br>
                            {displayTime(
                              c.class_date,
                              c.start_time,
                              c.end_time
                            )}
                          </td>
                          <td>
                            {user && user.role === "student" && (
                              <>{statusArray[c.status]}</>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Course;
