import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeatLoader } from "react-spinners";
import { Pie } from "react-chartjs-2";

const ClassStat = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  var array = window.location.href.split("/");
  var course_id = array[array.length - 3];
  var class_id = array[array.length - 1];
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
        setStats(res[0]);
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [course_id, class_id]);

  return (
    <div>
      {loading ? (
        <div className="container text-center mt-5">
          <BeatLoader loading />
        </div>
      ) : (
        stats && (
          <div>
            Present: {stats.present}
            <br />
            Absent: {stats.absent}
            <br />
            Late: {stats.late} <br />
            <Pie data={stats} />
          </div>
        )
      )}
    </div>
  );
};

export default ClassStat;
