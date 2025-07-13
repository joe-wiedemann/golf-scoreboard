import { useCallback } from 'react'

export const useMobileClick = (callback: () => void) => {
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't prevent default - let the browser handle it naturally
    callback()
  }, [callback])

  // For mobile, we'll use a simple onClick handler
  // Modern mobile browsers handle onClick well for buttons
  return {
    onClick: handleClick,
  }
} 