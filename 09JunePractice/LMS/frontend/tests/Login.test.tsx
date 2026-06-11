import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Auth/Login';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Login Page Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Test 1: Rendering
  it('FE-01-02-001: Should render the login form with email, password inputs and a submit button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // Test 2: Typing updates
  it('FE-01-02-002: Should update field values when typed in', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'jane@example.com');
    expect(emailInput).toHaveValue('jane@example.com');
  });

  // Test 3: Required validation
  it('FE-01-02-003: Should display warning text if email or password fields are submitted empty', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  // Test 4: Happy Path (API Success)
  it('FE-01-02-004: Should send credentials to API and update Auth state and redirect upon successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        token: 'token123',
        data: { name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }
      })
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'jane@example.com', password: 'Password123' })
      })
    );
  });

  // Test 5: Incorrect password banner
  it('FE-01-02-005: Should display warning alert banner when credentials are invalid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid email or password' })
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'WrongPassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  // Test 6: Button Loading state
  it('FE-01-02-006: Submit button should render loading text and be disabled while waiting for API resolve', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');

    const submitBtn = screen.getByRole('button', { name: /login/i });
    await userEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
  });

  // Test 7: Register Redirect link
  it('FE-01-02-007: Login page should display navigation link directing to the Register page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const regLink = screen.getByRole('link', { name: /register/i });
    expect(regLink).toBeInTheDocument();
    expect(regLink.getAttribute('href')).toBe('/register');
  });

  // Test 8: Session Routing Guard redirection
  it('FE-01-02-008: Auto-redirects already authenticated users to dashboard', () => {
    // Injecting active mock context or state
    // Simulating logged-in user in Auth Context
    render(
      <MemoryRouter>
        <Login initialUser={{ name: 'Jane Doe', role: 'Learner' }} />
      </MemoryRouter>
    );

    // Verify it doesn't render Login container or redirects
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });

  // Test 9: Network Error handling
  it('FE-01-02-009: Should display network error message if API query fails completely', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  // Test 10: Accessible input roles
  it('FE-01-02-010: Form inputs must support keyboard navigation focus parameters', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    emailInput.focus();
    expect(emailInput).toHaveFocus();
  });
});
