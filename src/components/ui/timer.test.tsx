import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Timer } from './timer';

// Mock timers for testing
jest.useFakeTimers();

// Mock the lucide-react icons
jest.mock('lucide-react');

describe('Timer Component', () => {
  // Basic rendering tests
  test('renders with required props', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Check if the main timer elements are rendered
    expect(screen.getByTestId('timer-component')).toBeInTheDocument();
    expect(screen.getByText('Development Process')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  test('renders with film and developer info', () => {
    render(
      <Timer 
        developmentTime={11} 
        temperature={20} 
        filmName="Kentmere 400"
        filmFormat="35mm"
        filmIso="400"
        developerName="Ilfosol 3"
        developerDilution="1+14"
        totalVolume={500}
      />
    );
    
    // Check if film and developer info is rendered
    expect(screen.getByText(/Kentmere 400/)).toBeInTheDocument();
    expect(screen.getByText(/Ilfosol 3/)).toBeInTheDocument();
    expect(screen.getByText(/1\+14/)).toBeInTheDocument();
    expect(screen.getByText(/500ml/)).toBeInTheDocument();
  });

  test('renders all process steps', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Check if all process steps are rendered
    expect(screen.getByTestId('development-step')).toBeInTheDocument();
    expect(screen.getByTestId('stop-bath-step')).toBeInTheDocument();
    expect(screen.getByTestId('fixer-step')).toBeInTheDocument();
    expect(screen.getByTestId('washing-step')).toBeInTheDocument();
  });

  // Timer functionality tests
  test('starts timer when start button is clicked', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Find and click the start button
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Timer should start running
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  test('pauses and resumes timer', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Start the timer
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Find and click the pause button
    const pauseButton = screen.getByTitle('Pause Timer');
    fireEvent.click(pauseButton);
    
    // Find and click the resume button
    const resumeButton = screen.getByTitle('Resume Timer');
    fireEvent.click(resumeButton);
    
    // Timer should continue running
    expect(screen.getByText('Development')).toBeInTheDocument();
  });

  test('resets timer when reset button is clicked', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Start the timer
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Advance timer by 30 seconds
    act(() => {
      jest.advanceTimersByTime(30 * 1000);
    });
    
    // Find and click the reset button
    const resetButton = screen.getByTitle('Reset Timer');
    fireEvent.click(resetButton);
    
    // Timer should reset to initial development time
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  // Test timer countdown
  test('timer counts down correctly', () => {
    render(<Timer developmentTime={1} temperature={20} />);
    
    // Start the timer
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Initial time should be 1:00
    expect(screen.getByText('1:00')).toBeInTheDocument();
    
    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10 * 1000);
    });
    
    // Time should be 0:50
    expect(screen.getByText('0:50')).toBeInTheDocument();
  });

  // Test different process steps
  test('can start different process steps directly', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Find and click the stop bath step
    const stopBathStep = screen.getByTestId('stop-bath-step');
    fireEvent.click(stopBathStep);
    
    // Stop bath timer should be active
    expect(screen.getByText('Stop Bath')).toBeInTheDocument();
    
    // Find and click the fixer step
    const fixerStep = screen.getByTestId('fixer-step');
    fireEvent.click(fixerStep);
    
    // Fixer timer should be active
    expect(screen.getByText('Fixer')).toBeInTheDocument();
    
    // Find and click the washing step
    const washingStep = screen.getByTestId('washing-step');
    fireEvent.click(washingStep);
    
    // Washing timer should be active
    expect(screen.getByText('Washing')).toBeInTheDocument();
  });

  // Test temperature display
  test('displays correct temperature format', () => {
    render(<Timer developmentTime={11} temperature={20} temperatureUnit="celsius" />);
    
    // Check Celsius temperature format
    expect(screen.getByText(/at 20°C/)).toBeInTheDocument();
    
    // Render with Fahrenheit
    render(<Timer developmentTime={11} temperature={20} temperatureUnit="fahrenheit" />);
    
    // Check Fahrenheit temperature format (20°C = 68°F)
    expect(screen.getByText(/at 20°F/)).toBeInTheDocument();
  });

  // Test different development times based on color/bw film
  test('uses different default times for color and b&w film', () => {
    // B&W film (default)
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Start the stop bath timer
    const stopBathStep = screen.getByTestId('stop-bath-step');
    fireEvent.click(stopBathStep);
    
    // Default stop bath time for B&W should be 1:00
    expect(screen.getByText('1:00')).toBeInTheDocument();
    
    // Color film
    render(<Timer developmentTime={11} temperature={20} isColor={true} />);
    
    // Start the fixer timer
    const fixerStep = screen.getByTestId('fixer-step');
    fireEvent.click(fixerStep);
    
    // Default fixer time for color should be 6:30
    expect(screen.getByText('6:30')).toBeInTheDocument();
  });

  // Test edit functionality
  test('opens edit modal when edit button is clicked', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Find and click the edit button
    const editButton = screen.getByText(/Edit Process/);
    fireEvent.click(editButton);
    
    // Edit modal should be open
    expect(screen.getByText(/Edit Process Times/)).toBeInTheDocument();
  });

  // Test for dilution normalization
  test('normalizes dilution display from colon to plus format', () => {
    render(
      <Timer 
        developmentTime={11} 
        temperature={20} 
        developerName="Developer" 
        developerDilution="1:50" 
      />
    );
    
    // Dilution should be displayed as 1+50 instead of 1:50
    expect(screen.getByText(/\(1\+50\)/)).toBeInTheDocument();
  });
}); 