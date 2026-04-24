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
    expect(screen.getByTestId("timer-component")).toBeInTheDocument()
    expect(screen.getAllByText("Development calculator").length).toBeGreaterThan(0)
    expect(screen.getAllByText("11:00").length).toBeGreaterThan(0)
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

  test('renders pre-soak step first when initialProcessTimes includes preSoak', () => {
    render(
      <Timer
        developmentTime={11}
        temperature={20}
        initialProcessTimes={{ preSoak: 3, dev: 11, stop: 1, fix: 5, wash: 5 }}
      />
    );
    expect(screen.getByTestId('pre-soak-step')).toBeInTheDocument();
    expect(screen.getByText('Pre soak')).toBeInTheDocument();
  });

  test('start begins at pre-soak when preSoak duration is set', () => {
    render(
      <Timer
        developmentTime={11}
        temperature={20}
        initialProcessTimes={{ preSoak: 3, dev: 11, stop: 1, fix: 5, wash: 5 }}
      />
    );
    fireEvent.click(screen.getByTestId('start-button'));
    expect(screen.getAllByText('Pre soak').length).toBeGreaterThan(0);
  });

  // Timer functionality tests
  test('starts timer when start button is clicked', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Find and click the start button
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    expect(screen.getAllByText("Development").length).toBeGreaterThan(0)
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
    
    expect(screen.getAllByText("Development").length).toBeGreaterThan(0)
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
    expect(screen.getByTestId("main-time-display")).toHaveTextContent("11:00")
  });

  // Test timer countdown
  test('timer counts down correctly', () => {
    render(<Timer developmentTime={1} temperature={20} />);
    
    // Start the timer
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);
    
    // Initial time should be 1:00
    expect(screen.getByTestId("main-time-display")).toHaveTextContent("1:00")

    // Advance timer by 10 seconds
    act(() => {
      jest.advanceTimersByTime(10 * 1000);
    })

    // Time should be 0:50
    expect(screen.getByTestId("main-time-display")).toHaveTextContent("0:50")
  });

  // Test different process steps
  test('can start different process steps directly', () => {
    render(<Timer developmentTime={11} temperature={20} />);
    
    // Find and click the stop bath step
    const stopBathStep = screen.getByTestId('stop-bath-step');
    fireEvent.click(stopBathStep);
    
    expect(screen.getAllByText("Stop Bath").length).toBeGreaterThan(0)

    const fixerStep = screen.getByTestId("fixer-step")
    fireEvent.click(fixerStep)

    expect(screen.getAllByText("Fixer").length).toBeGreaterThan(0)

    const washingStep = screen.getByTestId("washing-step")
    fireEvent.click(washingStep)

    expect(screen.getAllByText("Washing").length).toBeGreaterThan(0)
  });

  test("does not show temperature line under main countdown", () => {
    render(
      <Timer
        developmentTime={11}
        temperature={20}
        temperatureUnit="celsius"
      />,
    )
    fireEvent.click(screen.getByTestId("start-button"))
    expect(screen.queryByText(/^at /)).not.toBeInTheDocument()
  })

  // Test different development times based on color/bw film
  test('uses different default times for color and b&w film', () => {
    const { unmount } = render(<Timer developmentTime={11} temperature={20} />);

    const stopBathStep = screen.getByTestId("stop-bath-step");
    fireEvent.click(stopBathStep);

    expect(screen.getAllByText("1:00").length).toBeGreaterThan(0)
    unmount();

    render(<Timer developmentTime={11} temperature={20} isColor={true} />);

    const fixerStep = screen.getByTestId("fixer-step");
    fireEvent.click(fixerStep);

    expect(screen.getAllByText("2:00").length).toBeGreaterThan(0)
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