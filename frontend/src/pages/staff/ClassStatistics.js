import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const ClassStat = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
        console.log(res);
        setLoading(false);
      } else {
        navigate("/");
        setLoading(false);
        return;
      }
    })();
  }, [course_id, class_id]);

  return <div>Wasssuppp</div>;
};

export default ClassStat;
