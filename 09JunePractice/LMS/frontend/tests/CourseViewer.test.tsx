import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseViewer from '../src/pages/Course/CourseViewer';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CourseViewer Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCourse = {
    id: 'c1',
    title: 'React 19 Advanced',
    modules: [
      {
        id: 'm1',
        title: 'Module 1',
        sequenceIndex: 0,
        topics: [
          { id: 't1', title: 'Topic 1.1: Hooks', sequenceIndex: 0 },
          { id: 't2', title: 'Topic 1.2: Suspense', sequenceIndex: 1 }
        ]
      }
    ]
  };

  const mockProgress = {
    progressPercent: 0,
    completedTopics: [],
    completedQuizzes: [],
    finalExamPassed: false
  };

  // Test 1: Sidebar rendering
  it('FE-03-02-001: Should render the course viewer structure, sidebar curriculum nodes, and progress bar', () => {
    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} />
      </MemoryRouter>
    );

    expect(screen.getByText('React 19 Advanced')).toBeInTheDocument();
    expect(screen.getByText('Topic 1.1: Hooks')).toBeInTheDocument();
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  // Test 2: Notes markdown rendering
  it('FE-02-03-002: Should compile and render Markdown text correctly inside notes resource view', () => {
    const topicWithNotes = {
      ...mockCourse,
      modules: [{
        ...mockCourse.modules[0],
        topics: [{
          id: 't1',
          title: 'Topic 1.1: Hooks',
          sequenceIndex: 0,
          resources: [{ type: 'Notes', content: '# Heading Text\nNotes markdown.' }]
        }]
      }]
    };

    render(
      <MemoryRouter>
        <CourseViewer course={topicWithNotes} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /heading text/i })).toBeInTheDocument();
  });

  // Test 3: Video iframe rendering
  it('FE-02-03-003: Should render HTML5 iframe embed player for video resource types', () => {
    const topicWithVideo = {
      ...mockCourse,
      modules: [{
        ...mockCourse.modules[0],
        topics: [{
          id: 't1',
          title: 'Topic 1.1: Hooks',
          sequenceIndex: 0,
          resources: [{ type: 'Video', url: 'https://youtube.com/embed/dQw4w9WgXcQ' }]
        }]
      }]
    };

    render(
      <MemoryRouter>
        <CourseViewer course={topicWithVideo} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    const videoIframe = screen.getByTitle(/video player/i);
    expect(videoIframe).toBeInTheDocument();
    expect(videoIframe.getAttribute('src')).toBe('https://youtube.com/embed/dQw4w9WgXcQ');
  });

  // Test 4: Mark complete action API post
  it('FE-03-02-004: Clicking Mark as Complete button triggers POST api complete request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { progressPercent: 50, completedTopics: ['t1'] } })
    });

    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /mark as completed/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/topics/t1/complete'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  // Test 5: Default first topic unlocked
  it('FE-03-03-005: Topic 1 of Module 1 should be clickable and unlocked by default', () => {
    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} />
      </MemoryRouter>
    );

    const t1Node = screen.getByTestId('sidebar-item-t1');
    expect(t1Node).not.toHaveClass('locked');
  });

  // Test 6: Next topic locked
  it('FE-03-03-006: Subsequent topics must render lock badges and block navigation click actions by default', () => {
    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} />
      </MemoryRouter>
    );

    const t2Node = screen.getByTestId('sidebar-item-t2');
    expect(t2Node).toHaveClass('locked');
    expect(screen.getByTestId('lock-icon-t2')).toBeInTheDocument();
  });

  // Test 7: Lock error screens on direct navigation bypass
  it('FE-03-03-007: Navigating to direct URL of locked topic renders locked error screen block', () => {
    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} activeTopicId="t2" />
      </MemoryRouter>
    );

    expect(screen.getByText(/this topic is locked/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark as completed/i })).not.toBeInTheDocument();
  });

  // Test 8: Unlocked state renders details
  it('FE-03-03-008: Unlocked topic page displays content details successfully', () => {
    const unlockedProgress = {
      ...mockProgress,
      completedTopics: ['t1']
    };

    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={unlockedProgress} activeTopicId="t2" />
      </MemoryRouter>
    );

    expect(screen.queryByText(/this topic is locked/i)).not.toBeInTheDocument();
  });

  // Test 9: Quiz Board Render
  it('FE-04-01-009: Should render quiz board options when topic contains assessment type', () => {
    const topicWithQuiz = {
      ...mockCourse,
      modules: [{
        ...mockCourse.modules[0],
        topics: [{
          id: 't1',
          title: 'Topic 1.1: Hooks',
          sequenceIndex: 0,
          assessment: {
            id: 'quiz1',
            questions: [{ id: 'q1', questionText: 'Q1 Text?', options: ['Opt A', 'Opt B'] }]
          }
        }]
      }]
    };

    render(
      <MemoryRouter>
        <CourseViewer course={topicWithQuiz} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    expect(screen.getByText('Q1 Text?')).toBeInTheDocument();
    expect(screen.getByLabelText('Opt A')).toBeInTheDocument();
  });

  // Test 10: Quiz submission passed redirects next topic
  it('FE-04-01-010: Passing quiz submits answers, updates progress state, and unlocks continue buttons', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, score: 100, passed: true, progressPercent: 50 })
    });

    const topicWithQuiz = {
      ...mockCourse,
      modules: [{
        ...mockCourse.modules[0],
        topics: [{
          id: 't1',
          title: 'Topic 1.1: Hooks',
          sequenceIndex: 0,
          assessment: {
            id: 'quiz1',
            questions: [{ id: 'q1', questionText: 'Q1?', options: ['A', 'B'] }]
          }
        }]
      }]
    };

    render(
      <MemoryRouter>
        <CourseViewer course={topicWithQuiz} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByLabelText('A'));
    await userEvent.click(screen.getByRole('button', { name: /submit quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/passed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to next topic/i })).toBeInTheDocument();
    });
  });

  // Test 11: Quiz failed blocks progression
  it('FE-04-01-011: Failing quiz displays fail alert banner, showing retake button and locking next steps', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, score: 0, passed: false })
    });

    const topicWithQuiz = {
      ...mockCourse,
      modules: [{
        ...mockCourse.modules[0],
        topics: [{
          id: 't1',
          title: 'Topic 1.1: Hooks',
          sequenceIndex: 0,
          assessment: {
            id: 'quiz1',
            questions: [{ id: 'q1', questionText: 'Q1?', options: ['A', 'B'] }]
          }
        }]
      }]
    };

    render(
      <MemoryRouter>
        <CourseViewer course={topicWithQuiz} progress={mockProgress} activeTopicId="t1" />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByLabelText('B'));
    await userEvent.click(screen.getByRole('button', { name: /submit quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /continue to next/i })).not.toBeInTheDocument();
    });
  });

  // Test 12: Final Exam Lock view
  it('FE-04-02-012: Renders final exam locked message if progress is not 100%', () => {
    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={mockProgress} activeView="final-exam" />
      </MemoryRouter>
    );

    expect(screen.getByText(/final exam is locked/i)).toBeInTheDocument();
  });

  // Test 13: Final Exam render questions
  it('FE-04-02-013: Final exam displays questions list if unlocked (progress 100%)', () => {
    const finishedProgress = {
      progressPercent: 100,
      completedTopics: ['t1', 't2'],
      completedQuizzes: [],
      finalExamPassed: false
    };

    const courseWithExam = {
      ...mockCourse,
      finalExam: {
        id: 'fe1',
        questions: [{ id: 'fq1', questionText: 'Exam Q1?', options: ['A', 'B'] }]
      }
    };

    render(
      <MemoryRouter>
        <CourseViewer course={courseWithExam} progress={finishedProgress} activeView="final-exam" />
      </MemoryRouter>
    );

    expect(screen.queryByText(/final exam is locked/i)).not.toBeInTheDocument();
    expect(screen.getByText('Exam Q1?')).toBeInTheDocument();
  });

  // Test 14: Certificate claim unlock
  it('FE-05-01-014: Certificate claim button should display only when finalExamPassed is true', () => {
    const examPassedProgress = {
      progressPercent: 100,
      completedTopics: ['t1', 't2'],
      completedQuizzes: [],
      finalExamPassed: true
    };

    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={examPassedProgress} activeView="final-exam" />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /download certificate/i })).toBeInTheDocument();
  });

  // Test 15: Download Certificate click triggers binary API
  it('FE-05-01-015: Clicking download certificate triggers GET api query and disables action button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['pdfdata'], { type: 'application/pdf' })
    });

    const examPassedProgress = {
      progressPercent: 100,
      completedTopics: ['t1', 't2'],
      completedQuizzes: [],
      finalExamPassed: true
    };

    render(
      <MemoryRouter>
        <CourseViewer course={mockCourse} progress={examPassedProgress} activeView="final-exam" />
      </MemoryRouter>
    );

    const downloadBtn = screen.getByRole('button', { name: /download certificate/i });
    await userEvent.click(downloadBtn);

    expect(downloadBtn).toBeDisabled();
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/certificate'),
      expect.any(Object)
    );
  });
});
