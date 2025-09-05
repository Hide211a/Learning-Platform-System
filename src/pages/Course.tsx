import { Box, Stack, Typography, Button, Chip, LinearProgress, Card, CardContent, List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCourseById, getLessonsByCourseId, getQuizzesByCourseId } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'
import { CheckCircle, PlayArrow, Quiz } from '@mui/icons-material'

export function Course() {
  const { courseId } = useParams()
  const { getCourseProgress, getLessonProgress, markLessonComplete, unmarkLessonComplete } = useProgress()
  const { data: course, isLoading: courseLoading, isError: courseError } = useQuery({ 
    queryKey: ['course', courseId], 
    queryFn: () => getCourseById(courseId!), 
    enabled: !!courseId 
  })
  
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessonsByCourseId(courseId!),
    enabled: !!courseId
  })
  
  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => getQuizzesByCourseId(courseId!),
    enabled: !!courseId
  })

  const courseProgress = courseId ? getCourseProgress(courseId) : null

  if (courseLoading) return <Typography>Loading...</Typography>
  if (courseError || !course) return <Typography color="error">Course not found</Typography>

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{course.fields.title}</Typography>
      <Typography>{course.fields.description}</Typography>
      {course.fields.coverUrl && (
        <img src={course.fields.coverUrl} alt="" height={200} style={{ borderRadius: 8 }} />
      )}

      {/* Course Progress */}
      {courseProgress && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Course Progress</Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Lessons Completed</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {courseProgress.completedLessons} of {courseProgress.totalLessons}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={courseProgress.totalLessons > 0 ? (courseProgress.completedLessons / courseProgress.totalLessons) * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            {courseProgress.averageQuizScore > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Quiz Score</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {courseProgress.averageQuizScore.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={courseProgress.averageQuizScore}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Main Course Video (if no lessons or as introduction) */}
      {course.fields.videoUrl && (
        <Box>
          <Typography variant="h5" gutterBottom>Course Introduction</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PlayArrow color="primary" />
            <Typography variant="h6">{course.fields.title} - Introduction</Typography>
            {courseId && (
              <Chip 
                label={getLessonProgress(courseId, 'main-video')?.completed ? "Completed" : "Not Started"}
                size="small" 
                color={getLessonProgress(courseId, 'main-video')?.completed ? "success" : "default"}
                variant="outlined" 
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button 
              component={RouterLink} 
              to={`/courses/${courseId}/video`}
              variant="contained"
              startIcon={<PlayArrow />}
            >
              Watch Introduction
            </Button>
            {courseId && (
              <>
                {getLessonProgress(courseId, 'main-video')?.completed ? (
                  <Button 
                    variant="outlined"
                    color="warning"
                    startIcon={<CheckCircle />}
                    onClick={() => unmarkLessonComplete(courseId, 'main-video')}
                    size="small"
                  >
                    Undo Complete
                  </Button>
                ) : (
                  <Button 
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => markLessonComplete(courseId, 'main-video')}
                    size="small"
                  >
                    Mark Complete
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Lessons */}
      <Box>
        <Typography variant="h5" gutterBottom>
          {lessons.length > 0 ? 'Course Lessons' : 'Lessons'}
        </Typography>
        {lessonsLoading ? (
          <Typography>Loading lessons...</Typography>
        ) : lessons.length > 0 ? (
          <List>
            {lessons.map((lesson) => {
              const isCompleted = courseId ? getLessonProgress(courseId, lesson.id)?.completed || false : false
              return (
                <ListItem key={lesson.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PlayArrow color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{lesson.fields.title}</Typography>
                        <Chip 
                          label={isCompleted ? "Completed" : "Not Started"}
                          size="small" 
                          color={isCompleted ? "success" : "default"}
                          variant="outlined" 
                        />
                      </Box>
                    }
                    secondary={lesson.fields.description}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      component={RouterLink} 
                      to={`/courses/${courseId}/lessons/${lesson.id}`}
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                    >
                      Watch
                    </Button>
                    {courseId && (
                      <>
                        {isCompleted ? (
                          <Button 
                            variant="outlined"
                            color="warning"
                            startIcon={<CheckCircle />}
                            onClick={() => unmarkLessonComplete(courseId, lesson.id)}
                            size="small"
                          >
                            Undo
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => markLessonComplete(courseId, lesson.id)}
                            size="small"
                          >
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </ListItem>
              )
            })}
          </List>
        ) : (
          <Typography color="text.secondary">
            {course.fields.videoUrl 
              ? "No additional lessons available for this course yet." 
              : "No lessons available for this course yet."
            }
          </Typography>
        )}
      </Box>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>Quizzes</Typography>
          <List>
            {quizzes.map((quiz) => (
              <ListItem key={quiz.id} sx={{ px: 0 }}>
                <ListItemIcon>
                  <Quiz color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary={quiz.fields.title}
                  secondary={quiz.fields.description}
                />
                <Button 
                  component={RouterLink} 
                  to={`/courses/${courseId}/quiz/${quiz.id}`}
                  variant="outlined"
                  size="small"
                  startIcon={<Quiz />}
                >
                  Take Quiz
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Stack>
  )
}

export default Course


