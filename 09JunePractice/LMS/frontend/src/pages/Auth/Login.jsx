import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Component
 * Renders the user sign-in page.
 * Handles validation, authentication POST requests, loading states, and redirects.
 *
 * @param {Object} props
 * @param {Object} props.initialUser - Represents an active user session if already authenticated
 */
export default function Login({ initialUser = null }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 1. Session Routing Guard: Auto-redirect/hide form if user is already authenticated
  if (initialUser) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setValidationErrors({});

    // Client-side required validation
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
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
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        const userObj = result.data;
        setUser(userObj);
        navigate(userObj.role === 'Instructor' ? '/instructor' : '/dashboard', { replace: true });
      } else {
        throw new Error(result.message || 'Invalid email or password');
      }
    } catch (err) {
      // Differentiate between network rejects and invalid credential errors
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setSubmitError('Network error. Please check your internet connection.');
      } else {
        setSubmitError(err.message || 'Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="card shadow border-0 bg-white p-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body text-center">
          {/* Logo and Typography */}
          <div className="mb-4">
            <h1 className="h3 text-primary fw-bold mb-1">Login</h1>
            <p className="text-muted small">Access your personalized learning journey</p>
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
              <label htmlFor="emailAddressInput" className="form-label fw-semibold text-dark small">
                Email address
              </label>
              <input
                type="email"
                className={`form-control py-2 ${validationErrors.email ? 'is-invalid' : ''}`}
                id="emailAddressInput"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {validationErrors.email && (
                <div className="invalid-feedback">{validationErrors.email}</div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="passwordInput" className="form-label fw-semibold text-dark small">
                Password
              </label>
              <input
                type="password"
                className={`form-control py-2 ${validationErrors.password ? 'is-invalid' : ''}`}
                id="passwordInput"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {validationErrors.password && (
                <div className="invalid-feedback">{validationErrors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold shadow-sm mb-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Redirect link to Register */}
          <p className="text-muted small mt-4 mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
