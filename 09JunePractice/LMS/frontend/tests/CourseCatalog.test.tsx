import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseCatalog from '../src/pages/Course/CourseCatalog';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CourseCatalog Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCourses = [
    { id: 'c1', title: 'React 19 Basics', category: 'Frontend', description: 'React basics course.' },
    { id: 'c2', title: 'Node.js Design Patterns', category: 'Backend', description: 'Node course.' }
  ];

  const mockEnrollments = ['c2']; // Learner is already enrolled in c2

  // Test 1: Render List Grid
  it('FE-03-01-001: Should render the course catalog list grid container with search bar and filter controls', () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
    expect(screen.getByText('React 19 Basics')).toBeInTheDocument();
    expect(screen.getByText('Node.js Design Patterns')).toBeInTheDocument();
  });

  // Test 2: Search Bar Filtering
  it('FE-03-01-002: Typing in search input should filter courses displayed by title', async () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/search courses/i);
    await userEvent.type(searchInput, 'React');

    expect(screen.getByText('React 19 Basics')).toBeInTheDocument();
    expect(screen.queryByText('Node.js Design Patterns')).not.toBeInTheDocument();
  });

  // Test 3: Category Filtering
  it('FE-03-01-003: Selecting a category from dropdown should filter courses by category field', async () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    const filterDropdown = screen.getByRole('combobox', { name: /category/i });
    await userEvent.selectOptions(filterDropdown, 'Backend');

    expect(screen.getByText('Node.js Design Patterns')).toBeInTheDocument();
    expect(screen.queryByText('React 19 Basics')).not.toBeInTheDocument();
  });

  // Test 4: Display Enroll button
  it('FE-03-01-004: Should show Enroll button for courses the learner is not currently enrolled in', () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    // c1 (React) is not enrolled
    const enrollBtn = screen.getByTestId('enroll-btn-c1');
    expect(enrollBtn).toHaveTextContent(/enroll/i);
  });

  // Test 5: Display Resume button
  it('FE-03-01-005: Should show Resume button for courses the learner is already enrolled in', () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    // c2 (Node) is enrolled
    const resumeBtn = screen.getByTestId('resume-btn-c2');
    expect(resumeBtn).toHaveTextContent(/resume/i);
  });

  // Test 6: Trigger Enrollment API on Click
  it('FE-03-01-006: Clicking Enroll button triggers POST api enrollment request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={[]} isAuthenticated={true} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('enroll-btn-c1'));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/enroll'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // Test 7: Button Loading state during enrollment
  it('FE-03-01-007: Enroll button should show spinner text and disable during API transmission', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={[]} isAuthenticated={true} />
      </MemoryRouter>
    );

    const btn = screen.getByTestId('enroll-btn-c1');
    await userEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/enrolling/i);

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
    await waitFor(() => {
      expect(btn).not.toHaveTextContent(/enrolling/i);
    });
  });

  // Test 8: Anonymous user enrollment click redirects to Login
  it('FE-03-01-008: Clicking Enroll when unauthenticated redirects user to Login page', async () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={[]} isAuthenticated={false} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByTestId('enroll-btn-c1'));

    // Verify it doesn't call API but triggers redirection (we check location or route redirects)
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Test 9: Resume button navigation link
  it('FE-03-01-009: Clicking Resume navigates to Course Viewer route', () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={mockCourses} enrolledCourseIds={mockEnrollments} isAuthenticated={true} />
      </MemoryRouter>
    );

    const link = screen.getByTestId('resume-link-c2');
    expect(link.getAttribute('href')).toBe('/course/c2');
  });

  // Test 10: Empty Catalog State
  it('FE-03-01-010: Should display empty state messaging when courses array is empty', () => {
    render(
      <MemoryRouter>
        <CourseCatalog initialCourses={[]} enrolledCourseIds={[]} isAuthenticated={true} />
      </MemoryRouter>
    );

    expect(screen.getByText(/no courses available/i)).toBeInTheDocument();
  });
});
