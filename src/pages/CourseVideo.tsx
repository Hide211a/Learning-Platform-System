import { Box, Stack, Typography, Paper, Button, Chip } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourseById } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'
import { CheckCircle, ArrowBack } from '@mui/icons-material'
import { YouTubePlayer } from '../components/YouTubePlayer'

export function CourseVideo() {
  const { courseId } = useParams()
  const { markLessonComplete, unmarkLessonComplete, getLessonProgress } = useProgress()
  const { data: course, isLoading, isError } = useQuery({ 
    queryKey: ['course', courseId], 
    queryFn: () => getCourseById(courseId!), 
    enabled: !!courseId 
  })

  const lessonProgress = courseId ? getLessonProgress(courseId, 'video') : null

  if (isLoading) return <Typography>Loading...</Typography>
  if (isError || !course) return <Typography color="error">Course not found</Typography>

  if (!course.fields.videoUrl) {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            component={RouterLink} 
            to={`/courses/${courseId}`}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back to Course
          </Button>
          <Typography variant="h4">{course.fields.title}</Typography>
        </Box>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No Video Available</Typography>
          <Typography color="text.secondary">
            This course doesn't have video content yet.
          </Typography>
        </Paper>
      </Stack>
    )
  }

  const handleMarkComplete = () => {
    if (courseId) {
      markLessonComplete(courseId, 'video')
    }
  }

  const handleUnmarkComplete = () => {
    if (courseId) {
      unmarkLessonComplete(courseId, 'video')
    }
  }

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            component={RouterLink} 
            to={`/courses/${courseId}`}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back to Course
          </Button>
          <Typography variant="h4">{course.fields.title}</Typography>
        </Box>
        
        {lessonProgress?.completed ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              icon={<CheckCircle />} 
              label="Completed" 
              color="success" 
              variant="filled"
            />
            <Button 
              variant="outlined" 
              startIcon={<CheckCircle />}
              onClick={handleUnmarkComplete}
              color="warning"
              size="small"
            >
              Undo
            </Button>
          </Box>
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
          videoInput={course.fields.videoUrl}
          title={course.fields.title}
          startTime={course.fields.videoStartTime}
          endTime={course.fields.videoEndTime}
          showThumbnail={false}
        />
      </Box>

      {course.fields.description && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Course Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {course.fields.description}
          </Typography>
        </Paper>
      )}

      {lessonProgress?.completed && (
        <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Course Video Completed!
          </Typography>
          <Typography variant="body2">
            Great job! You completed this course video on {lessonProgress.completedAt?.toLocaleDateString()}.
            {lessonProgress.timeSpent > 0 && (
              <> You spent {Math.round(lessonProgress.timeSpent / 60)} minutes learning.</>
            )}
          </Typography>
        </Paper>
      )}
    </Stack>
  )
}

export default CourseVideo
