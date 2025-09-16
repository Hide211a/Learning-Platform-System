// Performance monitoring utilities

export const measurePerformance = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')
  
  const metrics = {
    // Core Web Vitals
    FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    LCP: null as number | null,
    FID: null as number | null,
    CLS: null as number | null,
    
    // Navigation timing
    DOMContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    Load: navigation?.loadEventEnd - navigation?.loadEventStart,
    TTFB: navigation?.responseStart - navigation?.requestStart,
    
    // Resource timing
    totalResources: performance.getEntriesByType('resource').length,
    imageResources: performance.getEntriesByType('resource').filter(
      (entry: any) => entry.name.includes('.jpg') || entry.name.includes('.png') || entry.name.includes('.webp')
    ).length
  }

  // Measure LCP using Performance Observer
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry && lastEntry.startTime) {
          metrics.LCP = lastEntry.startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      
      // Also try to get existing LCP entries
      const existingEntries = performance.getEntriesByType('largest-contentful-paint')
      if (existingEntries.length > 0) {
        const lastEntry = existingEntries[existingEntries.length - 1] as any
        if (lastEntry && lastEntry.startTime) {
          metrics.LCP = lastEntry.startTime
        }
      }
    } catch (e) {
      console.warn('LCP measurement not supported:', e)
    }
  }

  return metrics
}

export const logPerformanceMetrics = () => {
  const metrics = measurePerformance()
  if (metrics) {
    console.group('🚀 Performance Metrics')
    console.log('FCP (First Contentful Paint):', metrics.FCP ? `${metrics.FCP.toFixed(2)}ms` : 'N/A')
    console.log('LCP (Largest Contentful Paint):', metrics.LCP ? `${metrics.LCP.toFixed(2)}ms` : 'N/A')
    console.log('DOM Content Loaded:', metrics.DOMContentLoaded ? `${metrics.DOMContentLoaded.toFixed(2)}ms` : 'N/A')
    console.log('Time to First Byte:', metrics.TTFB ? `${metrics.TTFB.toFixed(2)}ms` : 'N/A')
    console.log('Total Resources:', metrics.totalResources)
    console.log('Image Resources:', metrics.imageResources)
    console.groupEnd()
  }
}

// Auto-log performance metrics after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(logPerformanceMetrics, 1000)
  })
}
