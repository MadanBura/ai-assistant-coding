import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CourseCompletion from '../src/pages/Course/CourseCompletion';

describe('CourseCompletion Component Unit Tests', () => {
  const customCourse = {
    title: 'Financial Risk Management',
    finalScore: '92%',
    completionDate: 'April 15, 2026',
    timeInvested: '35 Hours',
    modulesCleared: '8 / 8',
    instructorName: 'Dr. Michael Chen',
    certificateId: 'EF-55112-MIC'
  };

  const customLearner = {
    name: 'Emily Watson',
    profilePicture: 'https://example.com/avatar.jpg'
  };

  it('Should render active learner congrats title and course details with fallback mock values', () => {
    render(
      <MemoryRouter>
        <CourseCompletion />
      </MemoryRouter>
    );
    screen.debug();

    // Verify congrats title default
    expect(screen.getByRole('heading', { name: /congratulations, alex!/i })).toBeInTheDocument();
    
    // Verify default certificate text presence
    expect(screen.getByText('Alex Sterling')).toBeInTheDocument();
    expect(screen.getByText('Advanced UI Design: The Art of Systems')).toBeInTheDocument();
    
    // Verify performance score default
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('42 Hours')).toBeInTheDocument();
    expect(screen.getByText('Sarah J. Miller')).toBeInTheDocument();
    expect(screen.getByText(/CERT-ID: EF-99234-AXS/i)).toBeInTheDocument();
  });

  it('Should render custom course and learner prop values when supplied', () => {
    render(
      <MemoryRouter>
        <CourseCompletion course={customCourse} learner={customLearner} />
      </MemoryRouter>
    );
    screen.debug();

    // Verify congrats title updates
    expect(screen.getByRole('heading', { name: /congratulations, emily watson!/i })).toBeInTheDocument();
    
    // Verify certificate text updates
    expect(screen.getByText('Emily Watson')).toBeInTheDocument();
    expect(screen.getByText('Financial Risk Management')).toBeInTheDocument();
    
    // Verify performance summary updates
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('35 Hours')).toBeInTheDocument();
    expect(screen.getByText('Dr. Michael Chen')).toBeInTheDocument();
    expect(screen.getByText(/CERT-ID: EF-55112-MIC/i)).toBeInTheDocument();
  });

  it('Should execute the callbacks when clicking CTA buttons', async () => {
    const handleDownload = vi.fn();
    const handleShare = vi.fn();
    const handleFeedback = vi.fn();

    render(
      <MemoryRouter>
        <CourseCompletion 
          course={customCourse} 
          learner={customLearner} 
          onDownload={handleDownload}
          onShare={handleShare}
          onViewFeedback={handleFeedback}
        />
      </MemoryRouter>
    );

    // Click download PDF
    const downloadBtn = screen.getByRole('button', { name: /download pdf/i });
    await userEvent.click(downloadBtn);
    expect(handleDownload).toHaveBeenCalled();

    // Click share achievement
    const shareBtn = screen.getByRole('button', { name: /share/i });
    await userEvent.click(shareBtn);
    expect(handleShare).toHaveBeenCalled();

    // Click feedback link
    const feedbackBtn = screen.getByRole('button', { name: /view course feedback/i });
    await userEvent.click(feedbackBtn);
    expect(handleFeedback).toHaveBeenCalled();
  });
});
