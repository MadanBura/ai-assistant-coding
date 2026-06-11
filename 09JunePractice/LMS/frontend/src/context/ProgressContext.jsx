import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { user, token } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEnrolledCourses = async () => {
    if (!user || !token || user.role !== 'Learner') {
      setEnrolledCourses([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEnrolledCourses(result.data);
        }
      } else {
        const result = await response.json().catch(() => ({}));
        setError(result.message || 'Failed to fetch enrolled courses');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching progress');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically refresh enrolled courses when user state changes
  useEffect(() => {
    fetchEnrolledCourses();
  }, [user, token]);

  const enrollInCourse = async (courseId) => {
    if (!token) throw new Error('Unauthenticated');
    const response = await fetch(`/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Enrollment failed');
    }
    // Refresh enrollments list
    await fetchEnrolledCourses();
    return result.data;
  };

  const markTopicCompleted = async (topicId) => {
    if (!token) throw new Error('Unauthenticated');
    const response = await fetch(`/topics/${topicId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Marking topic complete failed');
    }
    // Refresh enrollments list
    await fetchEnrolledCourses();
    return result.data;
  };

  const value = {
    enrolledCourses,
    isLoading,
    error,
    refreshEnrolledCourses: fetchEnrolledCourses,
    enrollInCourse,
    markTopicCompleted
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
