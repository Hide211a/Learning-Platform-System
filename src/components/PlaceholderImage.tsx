interface PlaceholderImageProps {
  width?: number | string
  height?: number | string
  text?: string
  className?: string
}

export const PlaceholderImage = ({ 
  width = '100%', 
  height = 200, 
  text = 'Course',
  className = ''
}: PlaceholderImageProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-t-2xl flex items-center justify-center text-white ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="text-2xl font-bold mb-2 drop-shadow-lg">
          📚
        </div>
        <div className="font-medium text-sm drop-shadow-md opacity-90">
          {text}
        </div>
      </div>
    </div>
  )
}