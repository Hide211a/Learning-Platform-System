import { Link } from 'react-router-dom'
import { useState } from 'react'
import { subscribeToNewsletter } from '../firebase'
import { useSettings } from '../features/settings/SettingsContext'

export function Footer() {
  const { settings } = useSettings()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage('Будь ласка, введіть email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Будь ласка, введіть правильний email')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await subscribeToNewsletter(email)
      if (result.success) {
        if (result.local) {
          setMessage('✅ Email збережено локально! (Firestore недоступний)')
        } else {
          setMessage('✅ Успішно підписалися на розсилку!')
        }
        setEmail('')
      } else {
        setMessage(`❌ ${result.error || 'Помилка при підписці. Спробуйте ще раз.'}`)
      }
    } catch (error) {
      setMessage('❌ Помилка при підписці. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">EduPlatform</h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Сучасна платформа для ефективного навчання з інтерактивними курсами, 
                персоналізованими рекомендаціями та детальною аналітикою прогресу.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                aria-label="Facebook"
              >
                <span className="text-lg">📘</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                aria-label="Twitter"
              >
                <span className="text-lg">🐦</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <span className="text-lg">💼</span>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                aria-label="YouTube"
              >
                <span className="text-lg">📺</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Навігація</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Головна
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Каталог курсів
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Про нас
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Контакти
                </Link>
              </li>
            </ul>
          </div>


          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Контакти</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📧</span>
                <a 
                  href={`mailto:${settings?.supportEmail || 'support@lms-platform.com'}`}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  {settings?.supportEmail || 'support@lms-platform.com'}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">🌐</span>
                <span className="text-gray-400">
                  {settings?.platformName || 'LMS Platform'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto md:mx-0">
            <h4 className="text-lg font-semibold mb-4">Підпишіться на оновлення</h4>
            <p className="text-gray-400 mb-4">
              Отримуйте новини про нові курси та функції платформи
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ваш email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg sm:rounded-l-none sm:rounded-r-lg font-semibold transition-colors duration-300 whitespace-nowrap"
                >
                  {isSubmitting ? '⏳' : 'Підписатися'}
                </button>
              </div>
              {message && (
                <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear} {settings?.platformName || 'EduPlatform'}. Всі права захищені.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <span className="text-gray-400 text-sm">Створено з ❤️ в Україні</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">🇺🇦</span>
              <span className="text-gray-400 text-sm">Українська</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
