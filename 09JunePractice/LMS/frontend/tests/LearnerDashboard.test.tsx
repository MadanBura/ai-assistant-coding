import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LearnerDashboard from '../src/pages/Dashboard/LearnerDashboard';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LearnerDashboard Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockEnrolledCourses = [
    {
      course: { id: 'c1', title: 'React 19 Basics', category: 'Frontend' },
      progressPercent: 50,
      finalExamPassed: false
    },
    {
      course: { id: 'c2', title: 'Node.js Basics', category: 'Backend' },
      progressPercent: 100,
      finalExamPassed: true
    }
  ];

  // Test 1: Render structure
  it('FE-03-02-001: Should render the Learner Dashboard layout structures and cards', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /my courses/i })).toBeInTheDocument();
    expect(screen.getByText('React 19 Basics')).toBeInTheDocument();
    expect(screen.getByText('Node.js Basics')).toBeInTheDocument();
  });

  // Test 2: Progress rendering check
  it('FE-03-02-002: Dashboard cards should render correct progress bars and percentages', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('50% Complete')).toBeInTheDocument();
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  // Test 3: Claim certificate button presence
  it('FE-05-01-003: Completed courses card should display a Download Certificate action button', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    const downloadBtn = screen.getByTestId('download-cert-btn-c2');
    expect(downloadBtn).toBeInTheDocument();
    expect(downloadBtn).toHaveTextContent(/download certificate/i);
  });

  // Test 4: Claim certificate button absence
  it('FE-05-01-004: Incomplete courses card should not display a Download Certificate action button', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('download-cert-btn-c1')).not.toBeInTheDocument();
  });

  // Test 5: Empty Enrollment State
  it('FE-03-02-005: Renders empty course enrollment notification and Link back to Catalog', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={[]} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/you are not enrolled in any courses/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /browse courses/i });
    expect(link.getAttribute('href')).toBe('/courses');
  });

  // Test 6: API Fetch Loading Indicator
  it('FE-03-02-006: Renders loading skeleton or spinner while fetching dashboard data', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={[]} isLoading={true} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  // Test 7: API Fetch error banner
  it('FE-03-02-007: Renders error alert banner if API dashboard retrieval fails', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={[]} isLoading={false} error="API Error loading dashboard" />
      </MemoryRouter>
    );

    expect(screen.getByText(/api error loading dashboard/i)).toBeInTheDocument();
  });

  // Test 8: Navigate button to Viewer
  it('FE-03-02-008: Resume button links should navigate to correct Course Viewer route', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    const link = screen.getByTestId('resume-link-c1');
    expect(link.getAttribute('href')).toBe('/course/c1');
  });

  // Test 9: Download button click API calls
  it('FE-05-01-009: Click download certificate on dashboard triggers binary API PDF compile', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['pdfdata'], { type: 'application/pdf' })
    });

    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    const btn = screen.getByTestId('download-cert-btn-c2');
    await userEvent.click(btn);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c2/certificate'),
      expect.any(Object)
    );
  });

  // Test 10: Accessible dashboard navigation
  it('FE-03-02-010: Dashboard headers must follow logical HTML heading hierarchy structure', () => {
    render(
      <MemoryRouter>
        <LearnerDashboard initialData={mockEnrolledCourses} isLoading={false} />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { level: 2, name: /my courses/i });
    expect(heading).toBeInTheDocument();
  });
});
