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

    expect(screen.getAllByText("2:00").length).toBeGreaterThan(0)

    const startButton = screen.getByTestId("start-button")
    fireEvent.click(startButton)

    expect(screen.getAllByText("Development").length).toBeGreaterThan(0)

    const stopBathStep = screen.getByTestId("stop-bath-step")
    fireEvent.click(stopBathStep)

    expect(screen.getAllByText("Stop Bath").length).toBeGreaterThan(0)

    const fixerStep = screen.getByTestId("fixer-step")
    fireEvent.click(fixerStep)

    expect(screen.getAllByText("Fixer").length).toBeGreaterThan(0)

    const washingStep = screen.getByTestId("washing-step")
    fireEvent.click(washingStep)

    expect(screen.getAllByText("Washing").length).toBeGreaterThan(0)
  });
}); 