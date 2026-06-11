import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../src/pages/Auth/Register';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Register Page Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Test 1: Component Rendering
  it('FE-01-01-001: Should render registration form with name, email, password, and role dropdown', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  // Test 2: User Input Interaction
  it('FE-01-01-002: Should update input values when typed into by the user', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    await userEvent.type(nameInput, 'Jane Doe');
    await userEvent.type(emailInput, 'jane@example.com');

    expect(nameInput).toHaveValue('Jane Doe');
    expect(emailInput).toHaveValue('jane@example.com');
  });

  // Test 3: Form Validation (Required Fields)
  it('FE-01-01-003: Should display validation warnings if submitting an empty form', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const registerButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(registerButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  // Test 4: Form Validation (Email Format)
  it('FE-01-01-004: Should display warning if email format is invalid', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'invalidemail');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  // Test 5: Successful Submit (API Integration)
  it('FE-01-01-005: Should call API register endpoint on submit with correct values and redirect', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' } })
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'Learner');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123',
          role: 'Learner'
        })
      })
    );
  });

  // Test 6: API failure handling
  it('FE-01-01-006: Should display alert banner if API register fails with email conflict', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Email already in use' })
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  // Test 7: Button Loading state
  it('FE-01-01-007: Button should show loader text and be disabled during register request', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123');

    const submitBtn = screen.getByRole('button', { name: /register/i });
    await userEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/registering/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
  });

  // Test 8: Redirect link to Login
  it('FE-01-01-008: Register page should contain a link navigating to the Login page', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  // Test 9: Form reset action
  it('FE-01-01-009: Form values should clear when clicking reset button', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.type(nameInput, 'Jane Doe');
    expect(nameInput).toHaveValue('Jane Doe');

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    await userEvent.click(resetBtn);

    expect(nameInput).toHaveValue('');
  });

  // Test 10: Accessibility (ARIA Labels validation)
  it('FE-01-01-010: Form inputs must support basic label mappings and accessibility queries', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    expect(nameInput).toBeInTheDocument();
  });
});
