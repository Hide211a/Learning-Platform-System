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
    if (!certificateRef.current) return

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = (pdfHeight - imgHeight * ratio) / 2

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const fileName = `Сертифікат_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      pdf.save(fileName)
      
      onGenerate()
    } catch (error) {
      console.error('Помилка генерації сертифіката:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Сертифікат про завершення курсу</h2>
          <button
            onClick={() => onGenerate()}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Сертифікат для генерації PDF */}
        <div ref={certificateRef} className="bg-white p-8 border-4 border-yellow-400 shadow-2xl">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-600 mb-2">СЕРТИФІКАТ</h1>
            <p className="text-xl text-gray-600">про завершення навчального курсу</p>
          </div>
          
          {/* Основний контент */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Цим підтверджується, що
            </p>
            <div className="border-b-2 border-gray-300 w-96 mx-auto mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{studentName}</h2>
            <p className="text-lg text-gray-700 mb-4">
              успішно завершив(ла) курс
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">"{courseTitle}"</h3>
          </div>
          
          {/* Дата та підпис */}
          <div className="flex justify-between items-end mt-12">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Дата завершення:</p>
              <p className="font-semibold">{completionDate}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Підпис директора:</p>
              <div className="border-b-2 border-gray-300 w-32"></div>
            </div>
          </div>
          
          {/* Логотип/Печатка */}
          <div className="absolute top-8 right-8">
            <div className="w-20 h-20 border-4 border-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold text-sm">LOGO</span>
            </div>
          </div>
        </div>
        
        {/* Кнопки */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={generateCertificate}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Завантажити сертифікат
          </button>
          <button
            onClick={() => onGenerate()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  )
}

