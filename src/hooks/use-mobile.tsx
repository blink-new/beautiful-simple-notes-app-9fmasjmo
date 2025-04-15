
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Primary hook implementation
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on mount
    checkMobile()
    
    // Add event listener for resize
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Alias for backward compatibility
export function useMobile() {
  const isMobile = useIsMobile()
  return { isMobile }
}