"use client"

import React, { useState, useEffect, useRef } from "react"
import { X, RotateCcw, Vibrate } from "lucide-react"

interface DevelopmentModeProps {
  isOpen: boolean
  onClose: () => void
  filmName: string
  developerName: string
  volume: string
  dilution: string
  time: number
}

export function DevelopmentMode({
  isOpen,
  onClose,
  filmName,
  developerName,
  volume,
  dilution,
  time
}: DevelopmentModeProps) {
  const [seconds, setSeconds] = useState(time)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<'developer' | 'stop' | 'fixer' | 'wash' | 'complete'>('developer')
  const scrollPositionRef = useRef<number>(0)
  const [shouldShake, setShouldShake] = useState(false)
  const [initialShakePeriod, setInitialShakePeriod] = useState(true)
  
  // Save scroll position when opening and restore when closing
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.documentElement.classList.add('darkroom-mode-active')
    } else {
      // Restore scrolling
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.documentElement.classList.remove('darkroom-mode-active')
      
      // Restore scroll position after a short delay to ensure DOM updates
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current)
      }, 50)
    }
    
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.documentElement.classList.remove('darkroom-mode-active')
    }
  }, [isOpen])
  
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1)
      }, 1000)
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false)
      // Move to next step
      if (currentStep === 'developer') setCurrentStep('stop')
      else if (currentStep === 'stop') setCurrentStep('fixer')
      else if (currentStep === 'fixer') setCurrentStep('wash')
      else if (currentStep === 'wash') setCurrentStep('complete')
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, seconds, currentStep])
  
  // Set appropriate time for each step
  useEffect(() => {
    if (currentStep === 'developer') {
      setSeconds(time)
      setInitialShakePeriod(true) // Reset to initial shake period when we start/reset development
    } else if (currentStep === 'stop') {
      setSeconds(30) // 30 seconds for stop bath
      setShouldShake(false) // No shaking for other steps
    } else if (currentStep === 'fixer') {
      setSeconds(300) // 5 minutes for fixer
      setShouldShake(false)
    } else if (currentStep === 'wash') {
      setSeconds(600) // 10 minutes for washing
      setShouldShake(false)
    }
  }, [currentStep, time])

  // Handle shaking intervals for development step
  useEffect(() => {
    // Only apply shaking logic during the developer step and when timer is running
    if (currentStep !== 'developer' || !isRunning) {
      setShouldShake(false);
      return;
    }

    const shakeInterval: NodeJS.Timeout | null = null;

    // Initial continuous shaking for first 30 seconds
    if (initialShakePeriod) {
      // Calculate how many seconds have passed since start
      const elapsedSeconds = time - seconds;
      
      if (elapsedSeconds < 30) {
        setShouldShake(true);
      } else {
        setInitialShakePeriod(false);
        setShouldShake(false);
      }
    } 
    // After initial period, shake for 10 seconds every minute
    else {
      // Calculate seconds within the current minute (mod 60)
      const secondsInCurrentMinute = seconds % 60;
      
      // Shake for the first 10 seconds of each minute (0-9)
      setShouldShake(secondsInCurrentMinute < 10);
    }

    return () => {
      if (shakeInterval) clearInterval(shakeInterval);
    }
  }, [currentStep, isRunning, seconds, time, initialShakePeriod]);
  
  // Reset development process
  const resetDevelopment = () => {
    setIsRunning(false)
    setCurrentStep('developer')
    setSeconds(time)
    setInitialShakePeriod(true)
    setShouldShake(false)
  }
  
  // Handle close with scroll position preservation
  const handleClose = () => {
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center overflow-hidden">
      {/* Header with info and close button */}
      <div className="w-full flex justify-between items-center bg-black border-b border-red-900/30">
        <div className="text-red-600 text-sm md:text-base p-2">
          {dilution} @ {formatTime(time)}
        </div>
        <button 
          onClick={handleClose}
          className="text-red-600 hover:text-red-400 transition-colors p-2"
          aria-label="Close development mode"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-full max-w-4xl mx-auto px-8 py-8">
        {/* Development info */}
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-red-600 text-center">Development Mode</h1>
        
        <div className="w-full text-red-600 mb-8 flex justify-center">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <span className="text-right mr-3">Film:</span>
              <span className="font-bold">{filmName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Developer:</span>
              <span className="font-bold">{developerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Volume:</span>
              <span className="font-bold">{volume}ml</span>
            </div>
            <div className="flex justify-between">
              <span className="text-right mr-3">Dilution:</span>
              <span className="font-bold">{dilution}</span>
            </div>
          </div>
        </div>
        
        {/* Timer display */}
        <div className="text-red-600 text-center mb-8 w-full">
          <div className="text-8xl md:text-9xl font-mono font-bold mb-4">
            {formatTime(seconds)}
          </div>
          <p className="text-xl md:text-2xl uppercase font-bold">
            {currentStep === 'complete' ? 'DEVELOPMENT COMPLETE' : `${currentStep.toUpperCase()} STEP`}
          </p>
          
          {/* Shake indicator */}
          {currentStep === 'developer' && isRunning && (
            <div className="mt-4">
              <div className={`flex items-center justify-center gap-2 ${shouldShake ? 'animate-pulse' : ''}`}>
                <Vibrate 
                  size={32} 
                  className={`text-red-600 ${shouldShake ? 'animate-vibrate' : 'opacity-50'}`} 
                  strokeWidth={shouldShake ? 2.5 : 1.5}
                />
                <span className={`text-lg font-bold ${shouldShake ? 'text-red-500' : 'text-red-600/50'}`}>
                  {shouldShake ? 'SHAKE NOW!' : 'Rest'}
                </span>
              </div>
              {initialShakePeriod && shouldShake && (
                <p className="text-sm mt-2">Continuous initial shaking</p>
              )}
              {!initialShakePeriod && (
                <p className="text-sm mt-2">Shake for 10 seconds every minute</p>
              )}
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6">
          {currentStep !== 'complete' && (
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
          )}
          
          {!isRunning && currentStep !== 'complete' && (
            <button
              onClick={() => {
                if (currentStep === 'developer') setCurrentStep('stop')
                else if (currentStep === 'stop') setCurrentStep('fixer')
                else if (currentStep === 'fixer') setCurrentStep('wash')
                else if (currentStep === 'wash') setCurrentStep('complete')
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl"
            >
              Next Step
            </button>
          )}
          
          <button
            onClick={resetDevelopment}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-900/30 text-red-600 border border-red-900 rounded-md hover:bg-red-900/50 transition-colors text-base md:text-xl flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
      
      {/* Process steps */}
      <div className="w-full flex justify-center gap-1 md:gap-4 px-2 overflow-x-auto py-4 border-t border-red-900/30">
        <div className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === 'developer' ? 'border-red-600 bg-red-900/30' : 'border-red-900/50 bg-transparent'}`}>
          <p className="text-red-600 font-bold">Developer</p>
        </div>
        <div className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === 'stop' ? 'border-red-600 bg-red-900/30' : 'border-red-900/50 bg-transparent'}`}>
          <p className="text-red-600 font-bold">Stop Bath</p>
        </div>
        <div className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === 'fixer' ? 'border-red-600 bg-red-900/30' : 'border-red-900/50 bg-transparent'}`}>
          <p className="text-red-600 font-bold">Fixer</p>
        </div>
        <div className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === 'wash' ? 'border-red-600 bg-red-900/30' : 'border-red-900/50 bg-transparent'}`}>
          <p className="text-red-600 font-bold">Wash</p>
        </div>
        <div className={`p-2 md:p-4 border rounded-md text-xs md:text-base ${currentStep === 'complete' ? 'border-red-600 bg-red-900/30' : 'border-red-900/50 bg-transparent'}`}>
          <p className="text-red-600 font-bold">Complete</p>
        </div>
      </div>
    </div>
  )
} 