import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeatLoader } from "react-spinners";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
Chart.register([Tooltip, Legend, ArcElement]);

const ClassStat = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  var array = window.location.href.split("/");
  var course_id = array[array.length - 3];
  var class_id = array[array.length - 1];
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);

  const [presentStudents, setPresentStudents] = useState([
    { name: "Azzaam", reg_no: "B190785CS" },
  ]);
  const [absentStudents, setAbsentStudents] = useState([
    { name: "Azzaam", reg_no: "B190785CS" },
    { name: "Jaseem", reg_no: "B190703CS" },
  ]);
  const [lateStudents, setLateStudents] = useState([
    { name: "Azzaam", reg_no: "B190785CS" },
    { name: "Jaseem", reg_no: "B190703CS" },
  ]);
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
          class_id +
          "/course/" +
          course_id +
          "/stat",
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        res = res[0];
        console.log(res);
        var labels = [];
        var data = [];
        for (let i in res) {
          labels.push(i);
          data.push(parseInt(res[i]));
        }
        setLabels(labels);
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [course_id, class_id]);

  const goToStudent = (reg_no) => {
    navigate("/courses/" + course_id + "/students/" + reg_no);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to={"/courses/" + course_id}>
              {course_id}
            </Link>{" "}
            &#62; Attendance Stats
          </h5>
        </div>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="d-flex w-100 flex-column">
          <div className="text-center mb-3">
            <Pie
              className=""
              data={{
                labels: labels,
                datasets: [
                  {
                    label: "My First Dataset",
                    data: data,
                    backgroundColor: [
                      "rgb(119, 221, 119)",
                      "rgb(255, 99, 132)",
                      "rgb(255, 205, 86)",
                    ],
                    hoverOffset: 4,
                  },
                ],
              }}
              options={{
                tooltips: {
                  enabled: true,
                },
                maintainAspectRatio: false,
                responsive: true,
                legend: { display: true, position: "right" },
              }}
            />
          </div>
          <div className="d-flex">
            <div className="col-4">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col" className="text-success">
                      Present ({presentStudents.length})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {presentStudents.map((p) => {
                    return (
                      <tr onClick={() => goToStudent(p.reg_no)}>
                        <td>{p.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="col-4">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col" className="text-danger">
                      Absent ({absentStudents.length})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {absentStudents.map((p) => {
                    return (
                      <tr onClick={() => goToStudent(p.reg_no)}>
                        <td>{p.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="col-4">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th scope="col" className="text-warning">
                      Late ({lateStudents.length})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lateStudents.map((p) => {
                    return (
                      <tr onClick={() => goToStudent(p.reg_no)}>
                        <td>{p.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassStat;
