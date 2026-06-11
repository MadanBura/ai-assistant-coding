import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizInterface from '../src/pages/Course/QuizInterface';

describe('QuizInterface Component Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockQuizData = {
    id: 'quiz-abc',
    title: 'Macroeconomics Quiz',
    durationMinutes: 10,
    questions: [
      {
        id: 'q1',
        type: 'MULTIPLE CHOICE',
        questionText: 'What is the inflation target rate?',
        options: ['1%', '2%', '3%', '4%'],
        correctAnswerIndex: 1
      },
      {
        id: 'q2',
        type: 'MULTIPLE CHOICE',
        questionText: 'Define GDP.',
        options: ['Gross Domestic Product', 'Gross Debt Ratio', 'Global Direct Price', 'General Demand Pattern'],
        correctAnswerIndex: 0
      }
    ]
  };

  it('Should render the header title, question progression, and countdown timer', () => {
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /macroeconomics quiz/i })).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('Should display the active question text and option cards', () => {
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} />
      </MemoryRouter>
    );

    expect(screen.getByText('What is the inflation target rate?')).toBeInTheDocument();
    expect(screen.getByText('1%')).toBeInTheDocument();
    expect(screen.getByText('2%')).toBeInTheDocument();
    expect(screen.getByText('3%')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
  });

  it('Should disable the Next button until an option is selected', () => {
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} />
      </MemoryRouter>
    );

    const nextBtn = screen.getByRole('button', { name: /next question/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Should enable the Next button after selecting an option', () => {
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} />
      </MemoryRouter>
    );

    const firstOption = screen.getByText('2%');
    fireEvent.click(firstOption);

    const nextBtn = screen.getByRole('button', { name: /next question/i });
    expect(nextBtn).toBeEnabled();
  });

  it('Should allow navigating between questions using Next and Previous', () => {
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} />
      </MemoryRouter>
    );

    // Initial page
    expect(screen.getByText('What is the inflation target rate?')).toBeInTheDocument();
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    expect(prevBtn).toBeDisabled();

    // Select and go next
    fireEvent.click(screen.getByText('2%'));
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));

    // Second page
    expect(screen.getByText('Define GDP.')).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();

    // Go back
    fireEvent.click(prevBtn);
    expect(screen.getByText('What is the inflation target rate?')).toBeInTheDocument();
  });

  it('Should submit the quiz and show results view when Submit is clicked', async () => {
    const handleSubmit = vi.fn();
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} onSubmit={handleSubmit} />
      </MemoryRouter>
    );

    // Q1
    fireEvent.click(screen.getByText('2%'));
    fireEvent.click(screen.getByRole('button', { name: /next question/i }));

    // Q2
    fireEvent.click(screen.getByText('Gross Domestic Product'));
    const submitBtn = screen.getByRole('button', { name: /submit quiz/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      'q1': '2%',
      'q2': 'Gross Domestic Product'
    });

    await waitFor(() => {
      expect(screen.getByText(/quiz completed/i)).toBeInTheDocument();
    });
  });

  it('Should trigger onClose callback when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} onClose={handleClose} />
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole('button', { name: /exit quiz/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });

  it('Should decrement the timer and auto-submit when time expires', async () => {
    const handleSubmit = vi.fn();
    render(
      <MemoryRouter>
        <QuizInterface quiz={mockQuizData} onSubmit={handleSubmit} />
      </MemoryRouter>
    );

    expect(screen.getByText('10:00')).toBeInTheDocument();

    // Advance time by 10 minutes
    act(() => {
      vi.advanceTimersByTime(600 * 1000);
    });

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/quiz completed/i)).toBeInTheDocument();
    });
  });
});
