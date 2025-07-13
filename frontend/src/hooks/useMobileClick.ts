import { useCallback } from 'react'

export const useMobileClick = (callback: () => void) => {
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    console.log('MobileClick: onClick fired', e.type)
    e.preventDefault()
    e.stopPropagation()
    callback()
  }, [callback])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    console.log('MobileClick: onTouchStart fired')
    // Don't prevent default on touch start to allow proper touch handling
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('MobileClick: onTouchEnd fired')
    e.preventDefault()
    e.stopPropagation()
    callback()
  }, [callback])

  // For mobile, we'll use both onClick and onTouchEnd
  // onClick works on most mobile browsers, onTouchEnd is backup
  return {
    onClick: handleClick,
    onTouchEnd: handleTouchEnd,
  }
} 