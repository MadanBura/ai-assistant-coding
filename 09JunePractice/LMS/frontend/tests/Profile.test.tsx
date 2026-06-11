import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../src/pages/Auth/Profile';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Profile Page Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Test 1: Rendering
  it('FE-01-03-001: Should render profile fields for name, email, and read-only role badge', () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  // Test 2: Populate values
  it('FE-01-03-002: Inputs should be pre-populated with current profile details', () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('jane@example.com');
  });

  // Test 3: Input modification
  it('FE-01-03-003: Editing text updates the field state values', async () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Smith');
    expect(nameInput).toHaveValue('Jane Smith');
  });

  // Test 4: Role read-only validation
  it('FE-01-03-004: Role dropdown/input must be disabled to prevent learner role elevation updates', () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const roleInput = screen.getByLabelText(/role/i);
    expect(roleInput).toBeDisabled();
  });

  // Test 5: Save changes success (API Integration)
  it('FE-01-03-005: Should trigger PUT API request on submit and update user values', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { name: 'Jane Smith', email: 'janesmith@example.com', role: 'Learner' } })
    });

    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Smith');

    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/profile'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Jane Smith', email: 'jane@example.com' })
      })
    );
  });

  // Test 6: Validation empty values
  it('FE-01-03-006: Submitting empty name should show validation error', async () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(screen.getByText(/name cannot be empty/i)).toBeInTheDocument();
  });

  // Test 7: Email collision error
  it('FE-01-03-007: Should display warning alert banner if API updates reject due to email conflict', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Email already in use' })
    });

    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'bob@example.com');

    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  // Test 8: Button Loading state
  it('FE-01-03-008: Save button should show loader text and disable during execution', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /save profile/i });
    await userEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
  });

  // Test 9: Network Error handling
  it('FE-01-03-009: Should display network error message if API profile updates reject completely', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  // Test 10: Accessibility HTML mappings
  it('FE-01-03-010: Form labels must properly map htmlFor fields for screen-reader accessibility', () => {
    render(
      <MemoryRouter>
        <Profile currentUser={{ name: 'Jane Doe', email: 'jane@example.com', role: 'Learner' }} />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput.getAttribute('id')).toBeDefined();
  });
});
