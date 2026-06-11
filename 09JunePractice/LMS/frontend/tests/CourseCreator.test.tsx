import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseCreator from '../src/pages/Course/CourseCreator';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CourseCreator Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  // Test 1: Rendering
  it('FE-02-01-001: Should render metadata input fields for course creation', () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create course/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/course title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create course/i })).toBeInTheDocument();
  });

  // Test 2: Input updates
  it('FE-02-01-002: Typing into inputs should update form values', async () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/course title/i);
    await userEvent.type(titleInput, 'Intro to Node.js');
    expect(titleInput).toHaveValue('Intro to Node.js');
  });

  // Test 3: Required Field warning
  it('FE-02-01-003: Submitting an empty form should show validation warning alerts', async () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /create course/i }));
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  // Test 4: Happy Path (API Success)
  it('FE-02-01-004: Should post parameters to course API on submit and redirect', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'course123', title: 'React Basics' } })
    });

    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/course title/i), 'React Basics');
    await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Software Engineering');
    await userEvent.type(screen.getByLabelText(/description/i), 'React tutorial');

    await userEvent.click(screen.getByRole('button', { name: /create course/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'React Basics',
          category: 'Software Engineering',
          description: 'React tutorial'
        })
      })
    );
  });

  // Test 5: Loading State
  it('FE-02-01-005: Create button should show loader text and disable during execution', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/course title/i), 'React Basics');
    await userEvent.type(screen.getByLabelText(/description/i), 'React tutorial');

    const submitBtn = screen.getByRole('button', { name: /create course/i });
    await userEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/creating/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
  });

  // Test 6: Access Restriction (Learner Block)
  it('FE-02-01-006: Renders forbidden message if user logged in is a Learner', () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Learner" />
      </MemoryRouter>
    );

    expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/course title/i)).not.toBeInTheDocument();
  });

  // Test 7: Deletion confirmation modal render
  it('FE-02-01-007: Clicking delete on dashboard displays confirmation modal', async () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" mockCourses={[{ id: 'c1', title: 'React' }]} />
      </MemoryRouter>
    );

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  // Test 8: Deletion cancel click
  it('FE-02-01-008: Clicking cancel inside modal dismisses dialog without executing deletion API', async () => {
    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" mockCourses={[{ id: 'c1', title: 'React' }]} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtn);

    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Test 9: Deletion confirmation happy path
  it('BE-02-01-009: Confirming course deletion triggers API DELETE requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" mockCourses={[{ id: 'c1', title: 'React' }]} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // Test 10: Creation Error check
  it('FE-02-01-010: Should display alert banner when API rejects course creation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Server creation error' })
    });

    render(
      <MemoryRouter>
        <CourseCreator userRole="Instructor" />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/course title/i), 'React Basics');
    await userEvent.type(screen.getByLabelText(/description/i), 'React tutorial');
    await userEvent.click(screen.getByRole('button', { name: /create course/i }));

    await waitFor(() => {
      expect(screen.getByText(/server creation error/i)).toBeInTheDocument();
    });
  });
});
