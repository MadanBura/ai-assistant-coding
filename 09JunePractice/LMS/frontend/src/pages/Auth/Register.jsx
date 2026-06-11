import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Register Component
 * Renders the user registration/sign-up page.
 * Handles validation, authentication POST requests, loading states, and reset actions.
 */
export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Learner');

  // Stateful flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Local validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const handleReset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('Learner');
    setValidationErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setValidationErrors({});

    // Client-side validations
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      // Form email format checks
      errors.email = 'Invalid email format';
    }
    if (!password.trim()) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        if (result.token || (result.data && result.data.token)) {
          localStorage.setItem('token', result.token || result.data.token);
        }
        const userObj = result.data.user || result.data;
        setUser(userObj);
        navigate(userObj.role === 'Instructor' ? '/instructor' : '/dashboard', { replace: true });
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      setSubmitError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="card shadow border-0 bg-white p-4" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body text-center">
          {/* Logo and Typography */}
          <div className="mb-4">
            <h1 className="h3 text-primary fw-bold mb-1">Register</h1>
            <p className="text-muted small">Start your 14-day free trial today</p>
          </div>

          {submitError && (
            <div className="alert alert-danger d-flex align-items-center mb-4 text-start" role="alert">
              <span className="me-2">⚠️</span>
              <div className="small">{submitError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="text-start">
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label fw-semibold text-dark small">
                Full Name
              </label>
              <input
                type="text"
                className={`form-control py-2 ${validationErrors.name ? 'is-invalid' : ''}`}
                id="fullName"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {validationErrors.name && (
                <div className="invalid-feedback">{validationErrors.name}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="emailAddress" className="form-label fw-semibold text-dark small">
                Email address
              </label>
              <input
                type="text"
                className={`form-control py-2 ${validationErrors.email ? 'is-invalid' : ''}`}
                id="emailAddress"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {validationErrors.email && (
                <div className="invalid-feedback">{validationErrors.email}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold text-dark small">
                Password
              </label>
              <input
                type="password"
                className={`form-control py-2 ${validationErrors.password ? 'is-invalid' : ''}`}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {validationErrors.password && (
                <div className="invalid-feedback">{validationErrors.password}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="role" className="form-label fw-semibold text-dark small">
                Role
              </label>
              <select
                className="form-select py-2"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Learner">Learner</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-50 py-2 fw-semibold"
                onClick={handleReset}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary w-50 py-2 fw-semibold shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          {/* Redirect link to Login */}
          <p className="text-muted small mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
