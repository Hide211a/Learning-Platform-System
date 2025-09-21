export interface YouTubeInfo {
  videoId: string
  urlType: 'watch' | 'embed' | 'short' | 'id'
}

export interface YouTubeThumbnails {
  default: string
  medium: string
  high: string
  standard: string
  maxres: string
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean
  start?: number
  end?: number
  controls?: boolean
  modestbranding?: boolean
  rel?: boolean
  showinfo?: boolean
}

// Функція для отримання інформації про YouTube відео
export const getYouTubeInfo = (input: string): YouTubeInfo | null => {
  if (!input) return null

  // Якщо це вже video ID (11 символів)
  if (input.length === 11 && /^[a-zA-Z0-9_-]+$/.test(input)) {
    return {
      videoId: input,
      urlType: 'id'
    }
  }

  // Різні формати YouTube URL
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // https://youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // https://youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) {
      const videoId = match[1]
      let urlType: YouTubeInfo['urlType'] = 'watch'
      
      if (input.includes('/shorts/')) {
        urlType = 'short'
      } else if (input.includes('/embed/')) {
        urlType = 'embed'
      }

      return {
        videoId,
        urlType
      }
    }
  }

  return null
}

// Функція для генерації embed URL
export const generateYouTubeEmbedUrl = (
  videoId: string, 
  options: YouTubeEmbedOptions = {}
): string => {
  const params = new URLSearchParams()
  
  if (options.autoplay) params.append('autoplay', '1')
  if (options.start) params.append('start', options.start.toString())
  if (options.end) params.append('end', options.end.toString())
  if (options.controls !== undefined) params.append('controls', options.controls ? '1' : '0')
  if (options.modestbranding) params.append('modestbranding', '1')
  if (options.rel !== undefined) params.append('rel', options.rel ? '1' : '0')
  if (options.showinfo !== undefined) params.append('showinfo', options.showinfo ? '1' : '0')

  const queryString = params.toString()
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`
}

// Функція для отримання thumbnail URL
export const getYouTubeThumbnails = (videoId: string): YouTubeThumbnails => {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`
  
  return {
    default: `${baseUrl}/default.jpg`,
    medium: `${baseUrl}/mqdefault.jpg`,
    high: `${baseUrl}/hqdefault.jpg`,
    standard: `${baseUrl}/sddefault.jpg`,
    maxres: `${baseUrl}/maxresdefault.jpg`
  }
}
