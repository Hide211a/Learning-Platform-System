import { Box, Stack, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, TextField, LinearProgress, Alert, Card, CardContent, Chip } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { getQuizById, type Question } from '../lib/contentful'
import { useProgress } from '../features/progress/ProgressContext'
import { CheckCircle, ArrowBack, Refresh } from '@mui/icons-material'

export function Quiz() {
  const { courseId, quizId } = useParams()
  const { saveQuizResult } = useProgress()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const [isResultSaved, setIsResultSaved] = useState(false)

  const { data: quiz, isLoading, isError } = useQuery({ 
    queryKey: ['quiz', quizId], 
    queryFn: () => getQuizById(quizId!), 
    enabled: !!quizId 
  })

  const questions: Question[] = quiz?.fields.questions || []

  useEffect(() => {
    if (quiz?.fields.durationMinutes) {
      setTimeLeft(quiz.fields.durationMinutes * 60)
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quiz])

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = () => {
    let correct = 0
    questions.forEach(question => {
      const userAnswer = answers[question.id]
      if (userAnswer) {
        if (question.type === 'multiple' && question.correctAnswers) {
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
          const isCorrect = question.correctAnswers.every(correct => userAnswers.includes(correct)) &&
                           userAnswers.every(user => question.correctAnswers!.includes(user))
          if (isCorrect) correct++
        } else if (question.type === 'single' && question.correctAnswer) {
          if (question.correctAnswer === userAnswer) correct++
        } else if (question.type === 'text' && question.correctAnswer) {
          if (question.correctAnswer.toLowerCase() === (userAnswer as string).toLowerCase()) correct++
        }
      }
    })
    setScore({ correct, total: questions.length })
    setIsSubmitted(true)
  }

  const handleSaveResult = () => {
    if (score && courseId && quizId) {
      saveQuizResult(courseId, quizId, score.correct, score.total, answers)
      setIsResultSaved(true)
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setIsSubmitted(false)
    setScore(null)
    setIsResultSaved(false)
    if (quiz?.fields.durationMinutes) {
      setTimeLeft(quiz.fields.durationMinutes * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) return <Typography>Loading...</Typography>
  if (isError || !quiz) return <Typography color="error">Quiz not found</Typography>

  if (isSubmitted && score) {
    const percentage = Math.round((score.correct / score.total) * 100)
    const isPassed = percentage >= 70
    
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Quiz Results</Typography>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h5">Your Score</Typography>
              <Chip 
                label={`${score.correct}/${score.total}`}
                color={isPassed ? 'success' : 'warning'}
                size="large"
              />
              <Chip 
                label={`${percentage}%`}
                color={isPassed ? 'success' : 'warning'}
                variant="outlined"
                size="large"
              />
            </Box>
            
            <Alert severity={isPassed ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {isPassed 
                ? `🎉 Congratulations! You passed the quiz with ${percentage}%`
                : `📚 You scored ${percentage}%. You need 70% to pass.`
              }
            </Alert>
            
            <Typography variant="body2" color="text.secondary">
              Quiz completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {!isResultSaved && (
            <Button 
              variant="contained" 
              startIcon={<CheckCircle />}
              onClick={handleSaveResult}
              color="success"
            >
              Save Result
            </Button>
          )}
          
          {isResultSaved && (
            <Button 
              variant="outlined" 
              startIcon={<CheckCircle />}
              disabled
              color="success"
            >
              Result Saved ✓
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRetakeQuiz}
          >
            Retake Quiz
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            component={RouterLink}
            to={`/courses/${courseId}`}
          >
            Back to Course
          </Button>
        </Box>
      </Stack>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  if (!currentQuestion) return <Typography>No questions available</Typography>

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">{quiz.fields.title}</Typography>
        <Typography variant="h6" color={timeLeft < 60 ? 'error' : 'primary'}>
          {formatTime(timeLeft)}
        </Typography>
      </Box>

      <LinearProgress 
        variant="determinate" 
        value={((currentQuestionIndex + 1) / questions.length) * 100} 
      />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {currentQuestion.text}
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          {currentQuestion.type === 'single' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'multiple' && (
            <Box>
              {currentQuestion.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={(answers[currentQuestion.id] as string[] || []).includes(option)}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion.id] as string[] || []
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option]
                          : currentAnswers.filter(a => a !== option)
                        handleAnswerChange(currentQuestion.id, newAnswers)
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </Box>
          )}

          {currentQuestion.type === 'text' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your answer..."
            />
          )}
        </FormControl>
      </Paper>

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          Previous
        </Button>
        {currentQuestionIndex === questions.length - 1 ? (
          <Button variant="contained" onClick={handleSubmit}>
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          >
            Next
          </Button>
        )}
      </Box>
    </Stack>
  )
}

export default Quiz


