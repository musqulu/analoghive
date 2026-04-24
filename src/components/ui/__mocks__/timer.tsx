// This is a simplified mock version of the Timer component for testing
import React from 'react';

interface TimerProps {
  developmentTime: number;
  temperature: number;
  filmName?: string;
  filmFormat?: "35mm" | "120" | "sheet";
  filmIso?: string;
  developerName?: string;
  developerDilution?: string;
  totalVolume?: number;
  temperatureUnit?: string;
  isColor?: boolean;
  constantAgitation?: boolean;
}

export function Timer({
  developmentTime,
  filmName,
  filmFormat = "35mm",
  filmIso,
  developerName,
  developerDilution,
  totalVolume = 500,
}: TimerProps) {
  const [currentStep, setCurrentStep] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Normalize dilution display
  const normalizeDilutionDisplay = (dilution: string | undefined): string | undefined => {
    if (!dilution) return dilution;
    return dilution.replace(':', '+');
  };
  
  // Start a specific timer step
  const startTimer = (step: string) => {
    setCurrentStep(step);
    setIsRunning(true);
  };
  
  return (
    <div data-testid="timer-component">
      <div className="timer-display">
        <h2>{currentStep || 'Development Process'}</h2>
        <div className="time">{formatTime(developmentTime * 60)}</div>

        {!isRunning ? (
          <button 
            onClick={() => startTimer('Development')}
            data-testid="start-button"
          >
            Start Development
          </button>
        ) : (
          <>
            <button data-testid="pause-button">Pause</button>
            <button data-testid="reset-button">Reset</button>
          </>
        )}
      </div>
      
      <div className="process-steps">
        <h3>Development calculator</h3>
        
        {/* Film and Developer Info */}
        {filmName && <p>Film: {filmName} ({filmFormat}) @ ISO {filmIso}</p>}
        {developerName && <p>Developer: {developerName} ({normalizeDilutionDisplay(developerDilution)})</p>}
        {totalVolume && <p>Volume: {totalVolume}ml</p>}
        
        {/* Process Steps */}
        <div 
          onClick={() => startTimer('Development')}
          data-testid="development-step"
        >
          Development
        </div>
        
        <div 
          onClick={() => startTimer('Stop Bath')}
          data-testid="stop-bath-step"
        >
          Stop Bath
        </div>
        
        <div 
          onClick={() => startTimer('Fixer')}
          data-testid="fixer-step"
        >
          Fixer
        </div>
        
        <div 
          onClick={() => startTimer('Washing')}
          data-testid="washing-step"
        >
          Washing
        </div>
        
        <button data-testid="edit-button">Edit Process</button>
      </div>
    </div>
  );
} 