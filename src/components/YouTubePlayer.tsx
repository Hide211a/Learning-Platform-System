import { getYouTubeInfo, generateYouTubeEmbedUrl, getYouTubeThumbnails } from '../lib/youtube'
import { Alert } from './ui/Alert'
import { Chip } from './ui/Chip'

interface YouTubePlayerProps {
  videoInput: string // Can be video ID or full YouTube URL
  title?: string
  startTime?: number
  endTime?: number
  autoplay?: boolean
  showThumbnail?: boolean
  width?: string | number
  height?: string | number
}

export function YouTubePlayer({
  videoInput,
  title,
  startTime,
  endTime,
  autoplay = false,
  showThumbnail = false,
  width = '100%',
  height = 'auto'
}: YouTubePlayerProps) {
  const youtubeInfo = getYouTubeInfo(videoInput)

  if (!youtubeInfo) {
    return (
      <Alert severity="error" className="mb-4">
        <h6 className="text-lg font-semibold mb-2">Invalid YouTube Video</h6>
        <p className="text-sm mb-2">
          Please provide a valid YouTube URL or video ID. 
          Supported formats:
        </p>
        <ul className="mt-2 pl-4 list-disc text-sm">
          <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://youtube.com/shorts/VIDEO_ID</li>
          <li>VIDEO_ID (11 characters)</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Provided input: "{videoInput}"
        </p>
      </Alert>
    )
  }

  const embedUrl = generateYouTubeEmbedUrl(youtubeInfo.videoId, {
    autoplay,
    start: startTime,
    end: endTime,
    controls: true,
    modestbranding: true,
    rel: false,
    showinfo: false
  })

  const thumbnails = getYouTubeThumbnails(youtubeInfo.videoId)

  return (
    <div>
      {/* Video Info */}
      <div className="flex items-center gap-2 mb-4">
        <Chip 
          size="sm"
          variant="primary"
        >
          YouTube {youtubeInfo.urlType}
        </Chip>
        {startTime && (
          <Chip 
            size="sm"
            variant="secondary"
          >
            Starts at {Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, '0')}
          </Chip>
        )}
        {endTime && (
          <Chip 
            size="sm"
            variant="secondary"
          >
            Ends at {Math.floor(endTime / 60)}:{(endTime % 60).toString().padStart(2, '0')}
          </Chip>
        )}
      </div>

      {/* Thumbnail Preview (optional) */}
      {showThumbnail && (
        <div className="mb-4 text-center">
          <img 
            src={thumbnails.high} 
            alt={`${title || 'Video'} thumbnail`}
            className="max-w-full h-auto rounded-lg shadow-lg"
            onError={(e) => {
              // Fallback to default thumbnail if high quality fails
              const target = e.target as HTMLImageElement
              target.src = thumbnails.default
            }}
          />
        </div>
      )}

      {/* Video Player */}
      <div 
        className="relative w-full max-w-full overflow-hidden"
        style={{ 
          width: width,
          height: height === 'auto' ? 0 : height,
          paddingBottom: height === 'auto' ? '56.25%' : 0, // 16:9 aspect ratio for auto height
        }}
      >
        <iframe
          src={embedUrl}
          title={title || 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg max-w-full"
        />
      </div>
    </div>
  )
}