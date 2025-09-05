/**
 * YouTube utility functions for extracting video IDs and generating embed URLs
 */

export type YouTubeUrlType = 'watch' | 'embed' | 'short' | 'invalid'

export interface YouTubeInfo {
  videoId: string
  urlType: YouTubeUrlType
  embedUrl: string
  thumbnailUrl: string
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  // Remove any whitespace
  url = url.trim()

  // If it's already just a video ID (11 characters, alphanumeric + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  // YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (watchMatch) {
    return watchMatch[1]
  }

  // YouTube short URL: https://youtube.com/shorts/VIDEO_ID
  const shortMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) {
    return shortMatch[1]
  }

  // YouTube embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) {
    return embedMatch[1]
  }

  return null
}

/**
 * Get YouTube video information from URL or video ID
 */
export function getYouTubeInfo(input: string): YouTubeInfo | null {
  const videoId = extractYouTubeVideoId(input)
  
  if (!videoId) {
    return null
  }

  // Determine URL type
  let urlType: YouTubeUrlType = 'watch'
  if (input.includes('/embed/')) {
    urlType = 'embed'
  } else if (input.includes('/shorts/')) {
    urlType = 'short'
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    urlType = 'watch'
  }

  return {
    videoId,
    urlType,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}

/**
 * Generate YouTube embed URL with options
 */
export function generateYouTubeEmbedUrl(videoId: string, options: {
  autoplay?: boolean
  start?: number
  end?: number
  loop?: boolean
  controls?: boolean
  modestbranding?: boolean
  rel?: boolean
  showinfo?: boolean
} = {}): string {
  const params = new URLSearchParams()

  if (options.autoplay) params.set('autoplay', '1')
  if (options.start) params.set('start', options.start.toString())
  if (options.end) params.set('end', options.end.toString())
  if (options.loop) params.set('loop', '1')
  if (options.controls === false) params.set('controls', '0')
  if (options.modestbranding) params.set('modestbranding', '1')
  if (options.rel === false) params.set('rel', '0')
  if (options.showinfo === false) params.set('showinfo', '0')

  const queryString = params.toString()
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`
}

/**
 * Validate if a string is a valid YouTube URL or video ID
 */
export function isValidYouTubeInput(input: string): boolean {
  return extractYouTubeVideoId(input) !== null
}

/**
 * Get YouTube video thumbnail URLs in different qualities
 */
export function getYouTubeThumbnails(videoId: string) {
  return {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}
