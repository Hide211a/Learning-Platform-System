import { Box, Typography, Alert, Chip } from '@mui/material'
import { getYouTubeInfo, generateYouTubeEmbedUrl, getYouTubeThumbnails } from '../lib/youtube'

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
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>Invalid YouTube Video</Typography>
        <Typography variant="body2">
          Please provide a valid YouTube URL or video ID. 
          Supported formats:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://youtube.com/shorts/VIDEO_ID</li>
          <li>VIDEO_ID (11 characters)</li>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Provided input: "{videoInput}"
        </Typography>
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
    <Box>
      {/* Video Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip 
          label={`YouTube ${youtubeInfo.urlType}`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
        {startTime && (
          <Chip 
            label={`Starts at ${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}`}
            size="small" 
            color="secondary" 
            variant="outlined" 
          />
        )}
        {endTime && (
          <Chip 
            label={`Ends at ${Math.floor(endTime / 60)}:${(endTime % 60).toString().padStart(2, '0')}`}
            size="small" 
            color="secondary" 
            variant="outlined" 
          />
        )}
      </Box>

      {/* Thumbnail Preview (optional) */}
      {showThumbnail && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <img 
            src={thumbnails.high} 
            alt={`${title || 'Video'} thumbnail`}
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: 8,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              // Fallback to default thumbnail if high quality fails
              const target = e.target as HTMLImageElement
              target.src = thumbnails.default
            }}
          />
        </Box>
      )}

      {/* Video Player */}
      <Box 
        sx={{ 
          position: 'relative', 
          width: width,
          height: height === 'auto' ? 0 : height,
          paddingBottom: height === 'auto' ? '56.25%' : 0, // 16:9 aspect ratio for auto height
          '& iframe': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <iframe
          src={embedUrl}
          title={title || 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </Box>

      {/* Video Details */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Video ID:</strong> {youtubeInfo.videoId}
        </Typography>
        {title && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            <strong>Title:</strong> {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <strong>Source:</strong> YouTube ({youtubeInfo.urlType})
        </Typography>
      </Box>
    </Box>
  )
}
