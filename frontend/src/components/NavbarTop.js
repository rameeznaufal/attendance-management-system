import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";


//This js file handles the navbar at the top of every page
const NavbarTop = ({ user, setUser, courses }) => {
  const navigate = useNavigate();

  const handleLogOut = async () => {
    setUser(null);
    await fetch(process.env.REACT_APP_API_URL + "/users/logout", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="md">
      <div className="container">
        <Navbar.Brand>
          <Link to="/" style={{ textDecoration: "none", color: "white" }}>
            Attendance Management System
          </Link>
        </Navbar.Brand>
        {user && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {(user.role === "student" || user.role === "staff") &&
                  courses.length !== 0 && (
                    <NavDropdown title="Courses" id="basic-nav-dropdown">
                      {courses &&
                        courses.map((c) => {
                          return (
                            <NavDropdown.Item>
                              <Link
                                key={c.course_id}
                                to={"/courses/" + c.course_id}
                                style={{
                                  textDecoration: "none",
                                  color: "black",
                                }}
                              >
                                {c.course_name + " (" + c.course_id + ")"}
                              </Link>
                            </NavDropdown.Item>
                          );
                        })}
                    </NavDropdown>
                  )}
              </Nav>
              <Nav>
                <Nav.Link onClick={handleLogOut}>Logout</Nav.Link>
                {user && user.role !== "admin" && (
                  <Link style={{ textDecoration: "none" }} to="/profile">
                    Profile
                  </Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </div>
    </Navbar>
  );
};

export default NavbarTop;
