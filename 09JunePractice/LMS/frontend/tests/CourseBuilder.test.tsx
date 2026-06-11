import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseBuilder from '../src/pages/Course/CourseBuilder';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CourseBuilder Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCurriculum = [
    {
      id: 'm1',
      title: 'Module 1: Setup',
      sequenceIndex: 0,
      topics: [
        { id: 't1', title: 'Topic 1.1: Installation', sequenceIndex: 0 }
      ]
    }
  ];

  // Test 1: Rendering Modules
  it('FE-02-02-001: Should render modules lists on curriculum editor screen', () => {
    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    expect(screen.getByText('Module 1: Setup')).toBeInTheDocument();
  });

  // Test 2: Rendering Topics
  it('FE-02-02-002: Should render nested topics lists under modules', () => {
    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    expect(screen.getByText('Topic 1.1: Installation')).toBeInTheDocument();
  });

  // Test 3: Add Module Action Trigger
  it('FE-02-02-003: Clicking Add Module button displays naming input form', async () => {
    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    const addModBtn = screen.getByRole('button', { name: /add module/i });
    await userEvent.click(addModBtn);

    expect(screen.getByPlaceholderText(/enter module title/i)).toBeInTheDocument();
  });

  // Test 4: Add Module API submit
  it('FE-02-02-004: Submitting new module title triggers API POST modules requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'm2', title: 'Module 2', sequenceIndex: 1 } })
    });

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /add module/i }));
    const input = screen.getByPlaceholderText(/enter module title/i);
    await userEvent.type(input, 'Module 2');
    await userEvent.click(screen.getByRole('button', { name: /save module/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/modules'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Module 2', sequenceIndex: 1 })
      })
    );
  });

  // Test 5: Add Topic Action Trigger
  it('FE-02-02-005: Clicking Add Topic button inside a module displays naming input', async () => {
    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    const addTopicBtn = screen.getByRole('button', { name: /add topic/i });
    await userEvent.click(addTopicBtn);

    expect(screen.getByPlaceholderText(/enter topic title/i)).toBeInTheDocument();
  });

  // Test 6: Add Topic API Submit
  it('FE-02-02-006: Submitting topic title triggers API POST topics requests under parent module', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 't2', title: 'Topic 1.2', sequenceIndex: 1 } })
    });

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={mockCurriculum} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /add topic/i }));
    const input = screen.getByPlaceholderText(/enter topic title/i);
    await userEvent.type(input, 'Topic 1.2');
    await userEvent.click(screen.getByRole('button', { name: /save topic/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/modules/m1/topics'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Topic 1.2', sequenceIndex: 1 })
      })
    );
  });

  // Test 7: Reordering modules (Up/Down arrow action)
  it('FE-02-02-007: Clicking reorder up/down triggers index swapping in UI elements', async () => {
    const multiModCurriculum = [
      ...mockCurriculum,
      { id: 'm2', title: 'Module 2: Basics', sequenceIndex: 1, topics: [] }
    ];

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={multiModCurriculum} />
      </MemoryRouter>
    );

    const reorderBtn = screen.getAllByRole('button', { name: /move down/i })[0];
    await userEvent.click(reorderBtn);

    // Verify Modules text nodes position swaps
    const items = screen.getAllByClassName('module-title-item');
    expect(items[0]).toHaveTextContent('Module 2: Basics');
  });

  // Test 8: Reordering API Submission
  it('FE-02-02-008: Swapping elements triggers batch PUT curriculum reorder request', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    const multiModCurriculum = [
      ...mockCurriculum,
      { id: 'm2', title: 'Module 2: Basics', sequenceIndex: 1, topics: [] }
    ];

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={multiModCurriculum} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getAllByRole('button', { name: /move down/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /save order/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/courses/c1/curriculum/reorder'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          modules: [
            { id: 'm1', sequenceIndex: 1 },
            { id: 'm2', sequenceIndex: 0 }
          ]
        })
      })
    );
  });

  // Test 9: Saving Reorder loading state
  it('FE-02-02-009: Save Order button should show loader text and disable during execution', async () => {
    let resolveRequest;
    mockFetch.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const multiModCurriculum = [
      ...mockCurriculum,
      { id: 'm2', title: 'Module 2: Basics', sequenceIndex: 1, topics: [] }
    ];

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={multiModCurriculum} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getAllByRole('button', { name: /move down/i })[0]);
    const saveBtn = screen.getByRole('button', { name: /save order/i });
    await userEvent.click(saveBtn);

    expect(saveBtn).toBeDisabled();
    expect(screen.getByText(/saving order/i)).toBeInTheDocument();

    resolveRequest({ ok: true, json: async () => ({ success: true }) });
    await waitFor(() => {
      expect(saveBtn).not.toHaveTextContent(/saving order/i);
    });
  });

  // Test 10: Reorder error rollback state
  it('FE-02-02-010: Reordering failure should trigger alert banner and rollback UI to original indices', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Reordering failed' })
    });
    const multiModCurriculum = [
      ...mockCurriculum,
      { id: 'm2', title: 'Module 2: Basics', sequenceIndex: 1, topics: [] }
    ];

    render(
      <MemoryRouter>
        <CourseBuilder courseId="c1" initialCurriculum={multiModCurriculum} />
      </MemoryRouter>
    );

    // Swap module positions in state
    await userEvent.click(screen.getAllByRole('button', { name: /move down/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /save order/i }));

    await waitFor(() => {
      expect(screen.getByText(/reordering failed/i)).toBeInTheDocument();
      // Swapped position rolls back
      const items = screen.getAllByClassName('module-title-item');
      expect(items[0]).toHaveTextContent('Module 1: Setup');
    });
  });
});
