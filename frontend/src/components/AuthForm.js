import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { validateLoginData, validateRegistrationData } from '../utils/validators';

const AuthForm = ({ mode = 'login', onSubmit, onToggleMode, loading = false }) => {
  const isLogin = mode === 'login';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Validate based on mode
    const validation = isLogin
      ? validateLoginData(formData)
      : validateRegistrationData(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors
    setErrors({});

    // Prepare data based on mode
    const submitData = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    // Call onSubmit callback
    try {
      await onSubmit(submitData);
    } catch (error) {
      setGeneralError(error.message || 'An error occurred. Please try again.');
    }
  };

  const handleToggle = () => {
    // Clear form and errors when toggling
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setGeneralError('');
    
    if (onToggleMode) {
      onToggleMode();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {generalError && (
        <Alert variant="danger" dismissible onClose={() => setGeneralError('')}>
          {generalError}
        </Alert>
      )}

      {/* Name Field (Registration only) */}
      {!isLogin && (
        <Form.Group className="mb-3">
          <Form.Label>Name *</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            placeholder="Enter your full name"
            disabled={loading}
            autoComplete="name"
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Email Field */}
      <Form.Group className="mb-3">
        <Form.Label>Email Address *</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          isInvalid={!!errors.email}
          placeholder="Enter your email"
          disabled={loading}
          autoComplete="email"
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password Field */}
      <Form.Group className="mb-3">
        <Form.Label>Password *</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          isInvalid={!!errors.password}
          placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 characters)'}
          disabled={loading}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
        {!isLogin && (
          <Form.Text className="text-muted">
            Password must be at least 6 characters long
          </Form.Text>
        )}
      </Form.Group>

      {/* Confirm Password Field (Registration only) */}
      {!isLogin && (
        <Form.Group className="mb-3">
          <Form.Label>Confirm Password *</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            isInvalid={!!errors.confirmPassword}
            placeholder="Re-enter your password"
            disabled={loading}
            autoComplete="new-password"
          />
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Submit Button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading
          ? isLogin
            ? 'Logging in...'
            : 'Creating account...'
          : isLogin
          ? 'Login'
          : 'Sign Up'}
      </Button>

      {/* Toggle Mode */}
      {onToggleMode && (
        <div className="text-center">
          <Button
            variant="link"
            onClick={handleToggle}
            className="text-decoration-none"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Login'}
          </Button>
        </div>
      )}

      {/* Forgot Password Link (Login only) */}
      {isLogin && (
        <div className="text-center mt-2">
          <Button
            variant="link"
            size="sm"
            className="text-decoration-none text-muted"
            disabled={loading}
          >
            Forgot Password?
          </Button>
        </div>
      )}
    </Form>
  );
};

export default AuthForm;