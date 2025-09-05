# 🚀 Покращення Contentful для кращого UX

## 📋 Проблема
Користувачі не знають, як отримати ID курсу для створення квізу.

## 💡 Рішення

### 1. Додати Reference поле в Contentful
Замість текстового поля "Course ID" використовувати Reference:

**В Contentful Console:**
1. Відкрийте content type "quiz"
2. Видаліть поле "Course ID" (Text)
3. Додайте нове поле:
   - **Field type:** `Reference`
   - **Field ID:** `course`
   - **Name:** `Course`
   - **Help text:** `Select the course this quiz belongs to`
   - **Validations:** `Reference to course content type`

### 2. Оновити код для роботи з Reference
```typescript
// В contentful.ts
export type QuizFields = {
  title: string
  description: string
  questions: any[]
  course: { sys: { id: string } } // Reference замість courseId
  order: number
}
```

### 3. Переваги Reference поля
- ✅ **Візуальний вибір** курсу зі списку
- ✅ **Валідація** - тільки існуючі курси
- ✅ **Автоматичне заповнення** ID
- ✅ **Кращий UX** для користувачів

### 4. Альтернативне рішення
Якщо не хочете змінювати структуру, можна:
- Додати інструкцію в Help text поля "Course ID"
- Створити admin панель для створення квізів
- Додати пошук курсів в Contentful

## 🎯 Рекомендація
**Використовуйте Reference поле** - це стандартний підхід в Contentful для зв'язків між контентом.
