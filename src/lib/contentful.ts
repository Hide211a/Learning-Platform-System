import { createClient } from 'contentful'

export const contentfulClient = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID as string,
  accessToken: import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN as string,
  host: 'cdn.contentful.com',
})

export type CourseFields = {
  title: string
  slug: string
  description?: string
  level?: string
  category?: string
  coverUrl?: string
  videoUrl?: string
  videoStartTime?: number
  videoEndTime?: number
  instructor?: string
  duration?: string
  overview?: string
  learningOutcomes?: string[]
  requirements?: string[]
  targetAudience?: string
}

export type LessonFields = {
  title: string
  description: string
  videoUrl: string
  videoStartTime?: number
  videoEndTime?: number
  courseId: string
  order: number
  duration?: string
  duraion?: string // Помилка в Contentful - поле називається 'duraion'
}

export type QuizFields = {
  title: string
  description: string
  questions: Question[]
  course: { sys: { id: string } }
  order: number
  duration?: string
}

export type Question = {
  id: string
  type: 'single' | 'multiple' | 'text'
  text: string
  options?: string[]
  correctAnswer?: string // Для single та text типів
  correctAnswers?: string[] // Для multiple типів
  explanation?: string
}

export async function getCourses(): Promise<Array<{ id: string; fields: CourseFields }>> {
  const res = await contentfulClient.getEntries({ content_type: 'course', limit: 20 })
  return res.items.map((e: any) => ({ 
    id: e.sys.id, 
    fields: {
      title: e.fields.title,
      slug: e.fields.slug,
      description: e.fields.description,
      level: e.fields.level,
      category: e.fields.category,
      coverUrl: e.fields.cover?.fields?.file?.url ? 'https:' + e.fields.cover.fields.file.url : undefined,
      videoUrl: e.fields.videoUrl,
      videoStartTime: e.fields.videoStartTime,
      videoEndTime: e.fields.videoEndTime,
      instructor: e.fields.instructor,
      duration: e.fields.duration,
      overview: e.fields.overview,
      learningOutcomes: e.fields.learningOutcomes,
      requirements: e.fields.requirements,
      targetAudience: e.fields.targetAudience,
    } 
  }))
}

export async function getCourseById(id: string): Promise<{ id: string; fields: CourseFields } | null> {
  try {
    const e = await contentfulClient.getEntry(id)
    return { id: e.sys.id, fields: {
      title: e.fields.title as string,
      slug: e.fields.slug as string,
      description: e.fields.description as string | undefined,
      level: e.fields.level as string | undefined,
      category: e.fields.category as string | undefined,
      coverUrl: (e.fields.cover as any)?.fields?.file?.url ? 'https:' + (e.fields.cover as any).fields.file.url : undefined,
      videoUrl: e.fields.videoUrl as string | undefined,
      videoStartTime: e.fields.videoStartTime as number | undefined,
      videoEndTime: e.fields.videoEndTime as number | undefined,
      instructor: e.fields.instructor as string | undefined,
      duration: e.fields.duration as string | undefined,
      overview: e.fields.overview as string | undefined,
      learningOutcomes: e.fields.learningOutcomes as string[] | undefined,
      requirements: e.fields.requirements as string[] | undefined,
      targetAudience: e.fields.targetAudience as string | undefined,
    } }
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export async function getLessonsByCourseId(courseId: string): Promise<Array<{ id: string; fields: LessonFields }>> {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'lesson',
      'fields.courseId': courseId,
      order: ['fields.order']
    })
    
    return response.items.map((e: any) => {
       // Debug: перевіряємо всі поля з Contentful
       console.log('Contentful lesson fields:', {
         id: e.sys.id,
         title: e.fields.title,
         duration: e.fields.duration,
         duraion: e.fields.duraion, // Помилка в Contentful
         allFields: Object.keys(e.fields)
       })
      
      return {
        id: e.sys.id,
        fields: {
          title: e.fields.title as string,
          description: e.fields.description as string,
          videoUrl: e.fields.videoUrl as string,
          videoStartTime: e.fields.videoStartTime as number,
          videoEndTime: e.fields.videoEndTime as number,
          courseId: e.fields.courseId as string,
          order: e.fields.order as number,
          duration: e.fields.duration as string
        }
      }
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return []
  }
}

export async function getLessonById(lessonId: string): Promise<{ id: string; fields: LessonFields } | null> {
  try {
    const response = await contentfulClient.getEntry(lessonId)
    const e = response as any
    
    return {
      id: e.sys.id,
      fields: {
        title: e.fields.title as string,
        description: e.fields.description as string,
        videoUrl: e.fields.videoUrl as string,
        videoStartTime: e.fields.videoStartTime as number,
        videoEndTime: e.fields.videoEndTime as number,
        courseId: e.fields.courseId as string,
        order: e.fields.order as number,
        duration: e.fields.duration as string
      }
    }
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return null
  }
}

export async function getQuizzesByCourseId(courseId: string): Promise<Array<{ id: string; fields: QuizFields }>> {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'quiz',
      'fields.course.sys.id': courseId,
      order: ['fields.order']
    })
    
    return response.items.map((e: any) => ({
      id: e.sys.id,
      fields: {
        title: e.fields.title as string,
        description: e.fields.description as string,
        questions: e.fields.questions as Question[],
        course: e.fields.course as { sys: { id: string } },
        order: e.fields.order as number,
        duration: e.fields.duration as string
      }
    }))
  } catch (error) {
    // If quiz content type doesn't exist, just return empty array
    console.log('Quiz content type not found, returning empty array')
    return []
  }
}

export async function getQuizById(quizId: string): Promise<{ id: string; fields: QuizFields } | null> {
  try {
    const response = await contentfulClient.getEntry(quizId)
    const e = response as any
    
    return {
      id: e.sys.id,
      fields: {
        title: e.fields.title as string,
        description: e.fields.description as string,
        questions: e.fields.questions as Question[],
        course: e.fields.course as { sys: { id: string } },
        order: e.fields.order as number,
        duration: e.fields.duration as string
      }
    }
  } catch (error) {
    // If quiz content type doesn't exist, return null
    console.log('Quiz content type not found, returning null')
    return null
  }
}


