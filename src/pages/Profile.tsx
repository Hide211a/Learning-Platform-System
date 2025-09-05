import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  Paper,
  Stack,
  Button
} from '@mui/material'
import { 
  School, 
  Quiz, 
  CheckCircle, 
  AccessTime, 
  TrendingUp,
  Person,
  Undo
} from '@mui/icons-material'
import { useAuth } from '../features/auth/AuthContext'
import { useProgress } from '../features/progress/ProgressContext'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'

export function Profile() {
  const { user } = useAuth()
  const { courseProgress, quizResults, lessonProgress, unmarkLessonComplete, removeQuizResult } = useProgress()
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: getCourses })

  if (!user) {
    return <Typography>Please sign in to view your profile</Typography>
  }

  const totalLessonsCompleted = Object.values(lessonProgress).filter(p => p.completed).length
  const totalQuizzesCompleted = quizResults.length
  const averageQuizScore = quizResults.length > 0 
    ? quizResults.reduce((sum, q) => sum + (q.score / q.totalQuestions), 0) / quizResults.length * 100
    : 0

  const coursesWithProgress = courses?.map(course => ({
    ...course,
    progress: courseProgress[course.id]
  })).filter(course => course.progress) || []

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      // Reset all lesson progress
      Object.keys(lessonProgress).forEach(key => {
        const [courseId, lessonId] = key.split('_')
        unmarkLessonComplete(courseId, lessonId)
      })
      
      // Reset all quiz results
      quizResults.forEach(result => {
        removeQuizResult(result.courseId, result.quizId)
      })
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      {/* User Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5">{user.email}</Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user.metadata.creationTime || '').toLocaleDateString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircle />} 
                  label={`${totalLessonsCompleted} lessons completed`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  icon={<Quiz />} 
                  label={`${totalQuizzesCompleted} quizzes taken`} 
                  color="primary" 
                  size="small" 
                />
                {(totalLessonsCompleted > 0 || totalQuizzesCompleted > 0) && (
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<Undo />}
                    onClick={handleResetProgress}
                  >
                    Reset Progress
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Statistics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Lessons Completed</Typography>
                    <Typography variant="body2" fontWeight="bold">{totalLessonsCompleted}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (totalLessonsCompleted / 10) * 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Average Quiz Score</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {averageQuizScore.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={averageQuizScore} 
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Courses in Progress</Typography>
                    <Typography variant="body2" fontWeight="bold">{coursesWithProgress.length}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (coursesWithProgress.length / 5) * 100)} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              {coursesWithProgress.length === 0 ? (
                <Typography color="text.secondary">
                  No course progress yet. Start learning to see your activity here!
                </Typography>
              ) : (
                <List>
                  {coursesWithProgress.slice(0, 5).map((course, index) => (
                    <div key={course.id}>
                      <ListItem>
                        <ListItemIcon>
                          <School color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={course.fields.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {course.progress?.completedLessons || 0} of {course.progress?.totalLessons || 0} lessons completed
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip 
                                  label={`${Math.round(((course.progress?.completedLessons || 0) / Math.max(1, course.progress?.totalLessons || 1)) * 100)}%`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {course.progress?.averageQuizScore && course.progress.averageQuizScore > 0 && (
                                  <Chip 
                                    label={`Quiz: ${course.progress.averageQuizScore.toFixed(0)}%`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < coursesWithProgress.length - 1 && <Divider />}
                    </div>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quiz Results */}
        {quizResults.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Quiz Results
                </Typography>
                <Grid container spacing={2}>
                  {quizResults.slice(-6).reverse().map((result, index) => {
                    const course = courses?.find(c => c.id === result.courseId)
                    const scorePercentage = (result.score / result.totalQuestions) * 100
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Quiz color="primary" />
                            <Typography variant="subtitle2" noWrap>
                              {course?.fields.title || 'Unknown Course'}
                            </Typography>
                          </Box>
                          <Typography variant="h4" color={scorePercentage >= 70 ? 'success.main' : 'warning.main'}>
                            {scorePercentage.toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {result.score} of {result.totalQuestions} correct
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.completedAt.toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default Profile


