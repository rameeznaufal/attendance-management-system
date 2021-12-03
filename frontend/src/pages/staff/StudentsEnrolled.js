import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router";

//This javascript file shows the students enrolled in the course
const Students = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  var array = window.location.href.split("/");
  var cid = array[array.length - 2];

  useEffect(() => {
    setLoading(true);
    setStudents([]);
    if (!user || user.role !== "staff") {
      navigate("/");
      return;
    }
    (async () => {
      let res = await fetch(
        process.env.REACT_APP_API_URL + "/courses/" + cid + "/students",
        {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        setStudents(res);
        setLoading(false);
      } else {
        setStudents([]);
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [cid]);

  const goToStudent = (reg_no) => {
    navigate("/courses/" + cid + "/students/" + reg_no);
    return;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to={"/courses/" + cid}>
              {cid}
            </Link>{" "}
            &#62; Manage Students
          </h5>
        </div>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="d-flex w-100 flex-column justify-content-center align-items-center shadow rounded p-3 mb-3">
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Roll No.</th>
                <th scope="col">Full Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                return (
                  <tr onClick={() => goToStudent(s.reg_no)}>
                    <td>{s.reg_no}</td>
                    <td>{s.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Students;
