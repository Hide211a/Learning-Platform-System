import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { getCourses } from '../lib/contentful'

interface CourseSelectorProps {
  value: string
  onChange: (courseId: string) => void
  label?: string
}

export function CourseSelector({ value, onChange, label = "Select Course" }: CourseSelectorProps) {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses()
  })

  if (isLoading) {
    return <Typography>Loading courses...</Typography>
  }

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {courses.map((course) => (
          <MenuItem key={course.id} value={course.id}>
            <Box>
              <Typography variant="body1">{course.fields.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {course.id}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CourseSelector
