import React, { useEffect, useState } from "react";
import { renderMatches, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { AiOutlineEdit } from "react-icons/ai";
const Course = ({ user }) => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [ongoingClasses, setOngoingClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [previousClasses, setPreviousClasses] = useState([]);
  const [courseID, setCourseID] = useState("");
  const [loading, setLoading] = useState(true);

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
        console.log("upcoming");
        setUpcomingClasses((prevValue) => [...prevValue, classes[c]]);
      } else if (curr_date - start_date > diff) {
        console.log("previous");
        setPreviousClasses((prevValue) => [...prevValue, classes[c]]);
      } else {
        console.log("ongoing");
        setOngoingClasses((prevValue) => [...prevValue, classes[c]]);
      }
    }
    console.log(upcomingClasses.length);
    console.log(previousClasses.length);
    console.log(ongoingClasses.length);
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
        let res2 = await fetch(
          process.env.REACT_APP_API_URL + "/courses/" + cid + "/classes",
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (res2.ok) {
          res2 = await res2.json();
          console.log(res2);
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

  const displayTime = (t1, t2) => {
    return getAMPM(t1) + " - " + getAMPM(t2);
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
            <p>Teacher(s): {course && staffsString(course.staffs)}</p>
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
              <div>
                <h6>ONGOING CLASSES</h6>
                {ongoingClasses.map((e) => {
                  return <p>{e.class_id}</p>;
                })}
              </div>
            )}
            {upcomingClasses.length > 0 && (
              <div className="mb-3">
                <h6>UPCOMING CLASSES</h6>
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Class</th>
                      <th scope="col">Slot</th>
                      {user.role === "staff" && <th scope="col"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingClasses.map((c) => {
                      return (
                        <tr className="align-items-center">
                          <td>{c.class_id}</td>
                          <td>
                            {String.fromCharCode(64 + c.slot_id) +
                              " (" +
                              displayTime(
                                new Date("2021-05-31 " + c.start_time),
                                new Date("2021-05-31 " + c.end_time)
                              ) +
                              ")"}
                          </td>
                          <td>
                            {user.role === "staff" ? (
                              <Link
                                to={
                                  "/courses/" + cid + "/classes/" + c.class_id
                                }
                              >
                                Edit
                              </Link>
                            ) : (
                              <Link
                                to={
                                  "/courses/" + cid + "/classes/" + c.class_id
                                }
                              >
                                Mark Attendance
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
              <div>
                <hr></hr>
                <h6>PREVIOUS CLASSES</h6>
                {previousClasses.map((e) => {
                  return <p>{e.class_id}</p>;
                })}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Course;
