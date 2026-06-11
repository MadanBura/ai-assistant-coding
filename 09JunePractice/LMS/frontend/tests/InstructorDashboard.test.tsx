import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import InstructorDashboard from '../src/pages/Dashboard/InstructorDashboard';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('InstructorDashboard Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCourses = [
    { id: 'c1', title: 'React 19 Advanced', category: 'Software' }
  ];

  const mockAnalytics = {
    totalEnrolled: 5,
    completionRate: 40,
    averageQuizScore: 85,
    averageFinalExamScore: 80,
    learners: [
      { id: 'l1', name: 'Jane Doe', email: 'jane@example.com', progressPercent: 100, completedAt: '2026-06-11' }
    ]
  };

  // Test 1: Rendering list
  it('FE-06-01-001: Should render the Instructor Dashboard displaying owned courses lists', () => {
    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /instructor dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('React 19 Advanced')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view analytics/i })).toBeInTheDocument();
  });

  // Test 2: Trigger Analytics API call
  it('FE-06-01-002: Clicking View Analytics triggers API GET request to course analytics endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAnalytics })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/analytics'),
      expect.any(Object)
    );
  });

  // Test 3: Analytics summary rendering
  it('FE-06-01-003: Successfully loaded analytics must render summary statistics cards', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAnalytics })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    await waitFor(() => {
      expect(screen.getByText('Total Enrolled: 5')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate: 40%')).toBeInTheDocument();
      expect(screen.getByText('Average Quiz Score: 85%')).toBeInTheDocument();
      expect(screen.getByText('Average Final Exam Score: 80%')).toBeInTheDocument();
    });
  });

  // Test 4: Analytics student table rendering
  it('FE-06-01-004: Successfully loaded analytics must render enrolled student detail lists table', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAnalytics })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  // Test 5: Close Analytics click
  it('FE-06-01-005: Clicking close inside the analytics panel hides the statistics details view', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockAnalytics })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    await waitFor(() => {
      expect(screen.getByText('Total Enrolled: 5')).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeBtn);

    expect(screen.queryByText('Total Enrolled: 5')).not.toBeInTheDocument();
  });

  // Test 6: Analytics API loading indicator
  it('FE-06-01-006: Renders loading message or spinner during active analytics API fetch requests', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true, data: mockAnalytics }) });
    await waitFor(() => {
      expect(screen.queryByText(/loading analytics/i)).not.toBeInTheDocument();
    });
  });

  // Test 7: Analytics API error banner
  it('FE-06-01-007: Renders warning alert banner if analytics API query fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Analytics load failed' })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    await waitFor(() => {
      expect(screen.getByText(/analytics load failed/i)).toBeInTheDocument();
    });
  });

  // Test 8: Refresh button triggers refetch
  it('FE-06-01-008: Clicking Refresh Analytics button triggers new API fetch request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockAnalytics })
    });

    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /view analytics/i }));

    await waitFor(() => {
      expect(screen.getByText('Total Enrolled: 5')).toBeInTheDocument();
    });

    // Clear call history and click refresh
    mockFetch.mockClear();
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/analytics'),
      expect.any(Object)
    );
  });

  // Test 9: Empty owned course state has action link
  it('FE-06-01-009: Displays empty dashboard message with redirect link to Create Course', () => {
    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText(/you have not created any courses yet/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /create a course/i });
    expect(link.getAttribute('href')).toBe('/course/create');
  });

  // Test 10: Accessible dashboard structure
  it('FE-06-01-010: Instructor portal widgets must match responsive layout grids classes', () => {
    render(
      <MemoryRouter>
        <InstructorDashboard initialCourses={mockCourses} />
      </MemoryRouter>
    );

    const container = screen.getByTestId('instructor-dashboard-wrapper');
    expect(container.className).toContain('container');
  });
});
