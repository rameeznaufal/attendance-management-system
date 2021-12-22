//This javascript file handles the Admin home page

import React from "react";
import { Link } from "react-router-dom";
const AdminHome = () => {
  return (
    <div className="d-flex w-100 flex-md-row flex-column">
      <Link className="btn btn-primary p-4 w-100 me-md-4 mb-3" to="/students">
        Manage Students
      </Link>
      <Link className="btn btn-primary p-4 w-100 me-md-4 mb-3" to="/staffs">
        Manage Staffs
      </Link>
      <Link className="btn btn-primary p-4 w-100 mb-3" to="/courses">
        Manage Courses
      </Link>
    </div>
  );
};

export default AdminHome;
