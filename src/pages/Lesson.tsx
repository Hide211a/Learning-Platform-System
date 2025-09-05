import { Box, Stack, Typography, Paper, Button, Chip } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLessonById } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'
import { CheckCircle, PlayArrow } from '@mui/icons-material'
import { YouTubePlayer } from '../components/YouTubePlayer'

export function Lesson() {
  const { courseId, lessonId } = useParams()
  const { markLessonComplete, getLessonProgress } = useProgress()
  const { data: lesson, isLoading, isError } = useQuery({ 
    queryKey: ['lesson', lessonId], 
    queryFn: () => getLessonById(lessonId!), 
    enabled: !!lessonId 
  })

  const lessonProgress = courseId && lessonId ? getLessonProgress(courseId, lessonId) : null

  if (isLoading) return <Typography>Loading...</Typography>
  if (isError || !lesson) return <Typography color="error">Lesson not found</Typography>

  const handleMarkComplete = () => {
    if (courseId && lessonId) {
      markLessonComplete(courseId, lessonId)
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{lesson.fields.title}</Typography>
        {lessonProgress?.completed ? (
          <Chip 
            icon={<CheckCircle />} 
            label="Completed" 
            color="success" 
            variant="filled"
          />
        ) : (
          <Button 
            variant="contained" 
            startIcon={<CheckCircle />}
            onClick={handleMarkComplete}
            color="success"
          >
            Mark as Complete
          </Button>
        )}
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Video</Typography>
        
        <YouTubePlayer
          videoInput={lesson.fields.videoUrl}
          title={lesson.fields.title}
          startTime={lesson.fields.videoStartTime}
          endTime={lesson.fields.videoEndTime}
          showThumbnail={false}
        />
      </Box>

      {lesson.fields.description && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {lesson.fields.description}
          </Typography>
        </Paper>
      )}

      {lessonProgress?.completed && (
        <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Lesson Completed!
          </Typography>
          <Typography variant="body2">
            Great job! You completed this lesson on {lessonProgress.completedAt?.toLocaleDateString()}.
            {lessonProgress.timeSpent > 0 && (
              <> You spent {Math.round(lessonProgress.timeSpent / 60)} minutes learning.</>
            )}
          </Typography>
        </Paper>
      )}
    </Stack>
  )
}

export default Lesson


