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
  coverUrl?: string
  videoUrl?: string
  videoStartTime?: number
  videoEndTime?: number
}

export type LessonFields = {
  title: string
  description: string
  videoUrl: string
  videoStartTime?: number
  videoEndTime?: number
  courseId: string
  order: number
}

export type QuizFields = {
  title: string
  description: string
  questions: any[]
  course: { sys: { id: string } }
  order: number
}

export type Question = {
  id: string
  type: 'single' | 'multiple' | 'text'
  text: string
  options?: string[]
  correctAnswers?: string[]
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
      coverUrl: e.fields.cover?.fields?.file?.url ? 'https:' + e.fields.cover.fields.file.url : undefined,
      videoUrl: e.fields.videoUrl,
      videoStartTime: e.fields.videoStartTime,
      videoEndTime: e.fields.videoEndTime,
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
      coverUrl: (e.fields.cover as any)?.fields?.file?.url ? 'https:' + (e.fields.cover as any).fields.file.url : undefined,
      videoUrl: e.fields.videoUrl as string | undefined,
      videoStartTime: e.fields.videoStartTime as number | undefined,
      videoEndTime: e.fields.videoEndTime as number | undefined,
    } }
  } catch {
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
    
    return response.items.map((e: any) => ({
      id: e.sys.id,
      fields: {
        title: e.fields.title as string,
        description: e.fields.description as string,
        videoUrl: e.fields.videoUrl as string,
        videoStartTime: e.fields.videoStartTime as number,
        videoEndTime: e.fields.videoEndTime as number,
        courseId: e.fields.courseId as string,
        order: e.fields.order as number
      }
    }))
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
        order: e.fields.order as number
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
        questions: e.fields.questions as any[],
        course: e.fields.course as { sys: { id: string } },
        order: e.fields.order as number
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
        questions: e.fields.questions as any[],
        course: e.fields.course as { sys: { id: string } },
        order: e.fields.order as number
      }
    }
  } catch (error) {
    // If quiz content type doesn't exist, return null
    console.log('Quiz content type not found, returning null')
    return null
  }
}


