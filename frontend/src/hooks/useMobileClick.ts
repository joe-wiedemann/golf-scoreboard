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
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    console.log('MobileClick: onTouchEnd fired')
    e.preventDefault()
    e.stopPropagation()
    callback()
  }, [callback])

  return {
    onClick: handleClick,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
} 