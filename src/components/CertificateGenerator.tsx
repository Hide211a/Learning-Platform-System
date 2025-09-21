import React, { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface CertificateGeneratorProps {
  courseTitle: string
  studentName: string
  completionDate: string
  onGenerate: () => void
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  courseTitle,
  studentName,
  completionDate,
  onGenerate
}) => {
  const certificateRef = useRef<HTMLDivElement>(null)

  const generateCertificate = async () => {
    if (!certificateRef.current) {
      console.error('❌ certificateRef.current is null')
      return
    }

    try {
      console.log('🔄 Початок генерації сертифіката...')
      
      // Генеруємо зображення з HTML
      console.log('📸 Генерація canvas...')
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: 595,
        height: 842
      })
      console.log('✅ Canvas створено:', canvas.width, 'x', canvas.height)

      // Створюємо PDF для A4 portrait
      console.log('📄 Створення PDF...')
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      
      // Розрахунок розмірів для A4 в portrait
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = (pdfHeight - imgHeight * ratio) / 2

      console.log('📐 Розміри PDF:', pdfWidth, 'x', pdfHeight)
      console.log('📐 Розміри зображення:', imgWidth, 'x', imgHeight)
      console.log('📐 Співвідношення:', ratio)

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      // Зберігаємо PDF
      const fileName = `Сертифікат_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      console.log('💾 Збереження файлу:', fileName)
      pdf.save(fileName)
      
      console.log('✅ Сертифікат успішно згенеровано!')
      onGenerate()
    } catch (error) {
      console.error('❌ Помилка генерації сертифіката:', error)
      alert('Помилка генерації сертифіката. Перевірте консоль для деталей.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 w-full max-w-4xl max-h-[95vh] overflow-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Сертифікат про завершення курсу</h2>
          <button
            onClick={() => onGenerate()}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
          >
            ×
          </button>
        </div>
        
        {/* Сертифікат для генерації PDF - A4 Portrait */}
        <div 
          ref={certificateRef} 
          className="bg-white border-4 p-6 sm:p-8 md:p-12 text-center relative shadow-2xl mx-auto"
          style={{ 
            width: '100%',
            maxWidth: '595px',
            aspectRatio: '595/842',
            borderColor: '#dc2626',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Декоративні смуги */}
          <div 
            className="absolute top-0 left-0 w-full h-2"
            style={{ background: 'linear-gradient(to right, #dc2626, #991b1b)' }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-full h-2"
            style={{ background: 'linear-gradient(to right, #991b1b, #dc2626)' }}
          ></div>
          
          {/* Логотип */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6">
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#dc2626' }}
            >
              <span className="text-white font-bold text-sm sm:text-base md:text-lg">LMS</span>
            </div>
          </div>
          
          {/* Основний контент */}
          <div className="pt-8 sm:pt-12 md:pt-16">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 md:mb-4"
              style={{ color: '#dc2626' }}
            >
              СЕРТИФІКАТ
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-12" style={{ color: '#374151' }}>про завершення навчального курсу</p>
            
            <div className="mb-8 sm:mb-12 md:mb-16">
              <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6" style={{ color: '#374151' }}>Цим підтверджується, що</p>
              <h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6"
                style={{ color: '#000000' }}
              >
                {studentName}
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-3 md:mb-4" style={{ color: '#374151' }}>успішно завершив(ла) курс</p>
              <div 
                className="rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 border-2"
                style={{ 
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca'
                }}
              >
                <h3 
                  className="text-lg sm:text-xl md:text-2xl font-bold"
                  style={{ color: '#b91c1c' }}
                >
                  "{courseTitle}"
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-6 sm:mt-8 md:mt-12 gap-4 sm:gap-0">
              <div className="text-left">
                <p className="text-xs sm:text-sm mb-1" style={{ color: '#6b7280' }}>Дата завершення:</p>
                <p className="text-sm sm:text-base md:text-lg font-bold" style={{ color: '#000000' }}>{completionDate}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm mb-1" style={{ color: '#6b7280' }}>Підпис директора:</p>
                <div className="relative mb-1">
                  <div 
                    className="border-b-2 w-24 sm:w-28 md:w-32 h-4 sm:h-5 md:h-6 mb-1"
                    style={{ borderColor: '#9ca3af' }}
                  ></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: '#dc2626' }}>
                      <path 
                        d="M6 6 L18 18 M18 6 L6 18" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs font-semibold" style={{ color: '#6b7280' }}>Свінтозельський Р.П.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <button
            onClick={generateCertificate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Завантажити сертифікат
          </button>
          <button
            onClick={() => onGenerate()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  )
}
