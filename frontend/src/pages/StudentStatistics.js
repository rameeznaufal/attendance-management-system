import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeatLoader } from "react-spinners";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
Chart.register([Tooltip, Legend, ArcElement]);

const StudentStatistics = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  var array = window.location.href.split("/");
  var course_id = array[array.length - 3];
  var reg_no = array[array.length - 1];
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    if (!user || (user.role !== "staff" && user.reg_no !== reg_no)) {
      navigate("/");
      return;
    }

    (async () => {
      let res = await fetch(
        process.env.REACT_APP_API_URL +
          "/classes/students/" +
          reg_no +
          "/courses/" +
          course_id,
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        res = await res.json();
        console.log(res);
        setData([res.present, res.absent, res.late]);
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [course_id, reg_no]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5>
            <Link className="" to={"/courses/" + course_id}>
              {course_id}
            </Link>{" "}
            &#62; Attendance Statistics
          </h5>
        </div>
      </div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        <div className="w-100 d-flex align-items-center justify-content-center flex-column">
          <div className="text-center mb-3 col-sm-4">
            <Pie
              data={{
                labels: ["Present", "Absent", "Late"],
                datasets: [
                  {
                    label: "Student attendance statistics",
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
                legend: { display: true, position: "right" },
              }}
            />
          </div>
          <div className="text-center">
            <h5>
              Present: {data[0]} (
              {Math.round(
                (data[0] / (data[0] + data[1] + data[2])) * 100
              ).toFixed(2)}
              %)
              <br></br>
              Absent: {data[1]} (
              {Math.round(
                (data[1] / (data[0] + data[1] + data[2])) * 100
              ).toFixed(2)}
              %)
              <br></br>
              Late: {data[2]} (
              {Math.round(
                (data[2] / (data[0] + data[1] + data[2])) * 100
              ).toFixed(2)}
              %)
              <br></br>
              Total: {data[0] + data[1] + data[2]}
            </h5>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStatistics;
