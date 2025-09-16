// Web Worker для обробки важких операцій з прогресом
self.onmessage = function(e) {
  const { type, data } = e.data

  switch (type) {
    case 'PARSE_PROGRESS':
      try {
        const parsed = JSON.parse(data.savedProgress)
        // Конвертуємо дати в фоновому режимі
        const progressEntries = Object.entries(parsed)
        for (const [key, value] of progressEntries) {
          if ((value as any).completedAt) {
            (value as any).completedAt = new Date((value as any).completedAt)
          }
        }
        self.postMessage({ type: 'PROGRESS_PARSED', data: parsed })
      } catch (error) {
        self.postMessage({ type: 'PROGRESS_ERROR', error: error.message })
      }
      break

    case 'PARSE_QUIZ_RESULTS':
      try {
        const parsed = JSON.parse(data.savedQuizResults)
        const results = []
        for (const result of parsed) {
          results.push({
            ...result,
            completedAt: new Date(result.completedAt)
          })
        }
        self.postMessage({ type: 'QUIZ_RESULTS_PARSED', data: results })
      } catch (error) {
        self.postMessage({ type: 'QUIZ_RESULTS_ERROR', error: error.message })
      }
      break

    case 'STRINGIFY_PROGRESS':
      try {
        const stringified = JSON.stringify(data.lessonProgress)
        self.postMessage({ type: 'PROGRESS_STRINGIFIED', data: stringified })
      } catch (error) {
        self.postMessage({ type: 'PROGRESS_ERROR', error: error.message })
      }
      break

    case 'STRINGIFY_QUIZ_RESULTS':
      try {
        const stringified = JSON.stringify(data.quizResults)
        self.postMessage({ type: 'QUIZ_RESULTS_STRINGIFIED', data: stringified })
      } catch (error) {
        self.postMessage({ type: 'QUIZ_RESULTS_ERROR', error: error.message })
      }
      break

    default:
      self.postMessage({ type: 'UNKNOWN_TYPE', error: 'Unknown message type' })
  }
}
