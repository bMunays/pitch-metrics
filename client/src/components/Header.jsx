import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; // Import the Context

const Header = () => {
  // "Listen" to the broadcast to get the user data and logout function
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Send them back to the login page
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <Activity className="me-2" size={24} color="#4ade80" />
          <span className="fw-bold">Pitch Metrics</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {/* If user exists, show Dashboard and Logout. If not, show Login. */}
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Navbar.Text className="text-light ms-lg-3 me-3 d-flex align-items-center">
                  <User size={18} className="me-1"/> 
                  {user.email.split('@')[0]} {/* Just show the first part of their email */}
                </Navbar.Text>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" className="text-warning">Login</Nav.Link>
            )}
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;