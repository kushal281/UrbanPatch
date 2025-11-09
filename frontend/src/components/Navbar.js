import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm" sticky="top">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <span className="fs-4">🏘️</span> UrbanPatch
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="px-3">
              Map
            </Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/profile" className="px-3">
                  Profile
                </Nav.Link>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <Nav.Link as={Link} to="/admin" className="px-3">
                    Admin
                  </Nav.Link>
                )}
                <div className="d-flex align-items-center gap-2 ms-2">
                  <span className="text-muted d-none d-lg-inline">
                    {user?.name}
                  </span>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="ms-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  as={Link}
                  to="/login"
                >
                  Login
                </Button>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;