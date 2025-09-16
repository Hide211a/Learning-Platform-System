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
    return <div className="text-gray-600">Loading courses...</div>
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      >
        <option value="">Select a course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.fields.title}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CourseSelector