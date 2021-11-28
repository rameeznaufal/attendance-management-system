import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
const Course = ({ user }) => {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (!user || (user.role !== "student" && user.role !== "staff")) {
      navigate("/");
      return;
    }
    var array = window.location.href.split("/");
    const course_id = array[array.length - 1];
    (async () => {
      if (user.role === "student") {
      } else if (user.role === "staff") {
      }
    })();
  }, []);

  return (
    <div>
      <Link to="/courses/TOC/add">Add</Link>
    </div>
  );
};

export default Course;
