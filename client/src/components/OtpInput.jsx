import React, { useRef, useEffect } from 'react'

export default function OtpInput({ value = ['', '', '', '', '', ''], onChange, disabled = false }) {
  const inputRefs = useRef([])

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  const handleInputChange = (e, index) => {
    const rawVal = e.target.value
    // Take only the last entered digit
    const digit = rawVal.replace(/\D/g, '').slice(-1)

    const nextOtp = [...value]
    nextOtp[index] = digit
    onChange(nextOtp)

    // Advance to next input if digit entered
    if (digit && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous input and clear it
        const nextOtp = [...value]
        nextOtp[index - 1] = ''
        onChange(nextOtp)
        inputRefs.current[index - 1].focus()
      } else {
        const nextOtp = [...value]
        nextOtp[index] = ''
        onChange(nextOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus()
    } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6)

    if (digitsOnly.length > 0) {
      const nextOtp = [...value]
      for (let i = 0; i < 6; i++) {
        nextOtp[i] = digitsOnly[i] || ''
      }
      onChange(nextOtp)

      const targetFocusIndex = Math.min(digitsOnly.length, 5)
      if (inputRefs.current[targetFocusIndex]) {
        inputRefs.current[targetFocusIndex].focus()
      }
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border-2 border-border/80 bg-background text-center text-xl sm:text-2xl font-black text-foreground shadow-xs outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 select-none"
          aria-label={`Digit ${index + 1} of 6`}
        />
      ))}
    </div>
  )
}
