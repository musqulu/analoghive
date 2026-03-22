import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Timer } from './ui/timer';

// Mock timers
jest.useFakeTimers();

// Mock the lucide-react icons
jest.mock('lucide-react');

describe('Development Process Integration Test', () => {
  test('Complete film development process workflow', () => {
    // Render the Timer component with test values
    render(
      <Timer
        developmentTime={2} // 2 minutes development time
        temperature={20}
        filmName="Kentmere 400"
        filmFormat="35mm"
        filmIso="400"
        developerName="Ilfosol 3"
        developerDilution="1+14"
        totalVolume={500}
      />
    );

    // Check initial state - timer should show development time
    expect(screen.getByText('2:00')).toBeInTheDocument();
    
    // 1. Start Development process
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Timer should be running, showing Development step
    expect(screen.getByText('Development')).toBeInTheDocument();
    
    // 4. Start Stop Bath directly
    const stopBathStep = screen.getByTestId('stop-bath-step');
    fireEvent.click(stopBathStep);
    
    // Timer should show Stop Bath step
    expect(screen.getByText('Stop Bath')).toBeInTheDocument();
    
    // 5. Start Fixer directly
    const fixerStep = screen.getByTestId('fixer-step');
    fireEvent.click(fixerStep);
    
    // Timer should show Fixer step
    expect(screen.getByText('Fixer')).toBeInTheDocument();
    
    // 7. Start Washing step
    const washingStep = screen.getByTestId('washing-step');
    fireEvent.click(washingStep);
    
    // Timer should show Washing step
    expect(screen.getByText('Washing')).toBeInTheDocument();
  });
}); 