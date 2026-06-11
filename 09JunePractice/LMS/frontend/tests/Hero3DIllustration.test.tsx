import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero3DIllustration from '../src/components/common/Hero3DIllustration';

describe('Hero3DIllustration Component Unit Tests', () => {
  it('Should render the 3D perspective wrapper and floating shape elements', () => {
    render(<Hero3DIllustration />);

    // Check that major nodes are rendered
    expect(screen.getByTestId('3d-book-node')).toBeInTheDocument();
    expect(screen.getByTestId('3d-globe-node')).toBeInTheDocument();
    expect(screen.getByTestId('3d-bulb-node')).toBeInTheDocument();

    // Check details within cards
    expect(screen.getByText('KNOWLEDGE')).toBeInTheDocument();
    expect(screen.getByText('GLOBAL')).toBeInTheDocument();
    expect(screen.getByText('IDEAS')).toBeInTheDocument();
  });
});
