import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
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
        <Navbar.Brand href="/">Attendance Management System</Navbar.Brand>
        {user && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {(user.role === "student" || user.role === "staff") &&
                  courses.length !== 0 && (
                    <NavDropdown title="Courses" id="basic-nav-dropdown">
                      {courses.map((c) => {
                        return (
                          <NavDropdown.Item href={"/courses/" + c.course_id}>
                            {c.course_name + " (" + c.course_id + ")"}
                          </NavDropdown.Item>
                        );
                      })}
                    </NavDropdown>
                  )}
              </Nav>
              <Nav>
                <Nav.Link onClick={handleLogOut}>Logout</Nav.Link>
                <Nav.Link href="#profile">Profile</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </>
        )}
      </div>
    </Navbar>
  );
};

export default NavbarTop;
