import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { DropdownButton, Dropdown} from "react-bootstrap";
import { Input } from "reactstrap"
import "bootstrap/dist/css/bootstrap.min.css";
import "../custom.scss";

const Navbar = ({ user, handleLogOut }) => {
  return (
    <>
      <nav className="navbar navbar-expand-sm bg-primary navbar-light">
        <div className="container-fluid">
          <NavLink to="/" className="navbar-brand">
            <b>Notes App</b>
          </NavLink>
          {user && (
            <div><DropdownButton DropdownIndicator={() => null} id="dropdown-basic-button" title={<FiSettings color="black" size="20" />}>
              <Dropdown.Item onClick={handleLogOut}>Log Out</Dropdown.Item>
              
          </DropdownButton></div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
