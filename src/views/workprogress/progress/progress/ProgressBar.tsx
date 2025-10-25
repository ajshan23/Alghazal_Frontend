import { useEffect, useState } from 'react'
import classNames from 'classnames'

interface ProgressBarProps {
  percent: number
  showInfo?: boolean
  className?: string
  strokeColor?: string
  trailColor?: string
  strokeWidth?: number
}

const ProgressBar = (props: ProgressBarProps) => {
  const {
    percent = 0,
    showInfo = false,
    className,
    strokeColor = '#3b82f6', // Default blue-500
    trailColor = '#e5e7eb', // Default gray-200
    strokeWidth = 8
  } = props

  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => {
    // Smooth animation for progress increase
    const timer = setTimeout(() => {
      setDisplayPercent(percent)
    }, 100)
    return () => clearTimeout(timer)
  }, [percent])

  const progressBarStyle = {
    backgroundColor: trailColor,
    height: `${strokeWidth}px`,
    borderRadius: `${strokeWidth / 2}px`
  }

  const progressStyle = {
    width: `${displayPercent}%`,
    backgroundColor: strokeColor,
    height: '100%',
    borderRadius: `${strokeWidth / 2}px`,
    transition: 'width 0.3s ease-in-out'
  }

  return (
    <div className={classNames('w-full', className)}>
      <div style={progressBarStyle}>
        <div style={progressStyle} />
      </div>
      {showInfo && (
        <div className="text-right mt-1 text-sm text-gray-600 dark:text-gray-300">
          {displayPercent.toFixed(0)}%
        </div>
      )}
    </div>
  )
}

export default ProgressBar