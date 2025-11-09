import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <div className="text-center">
        <div style={{ fontSize: '120px' }}>🔍</div>
        <h1 className="display-1 fw-bold mt-4">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;