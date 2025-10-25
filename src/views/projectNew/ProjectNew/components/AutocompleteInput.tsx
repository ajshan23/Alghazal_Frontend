import { useState, useEffect } from 'react'
import { Field, useField } from 'formik'
import { Input } from '@/components/ui'

interface AutocompleteInputProps {
  suggestions: string[]
  name: string
  [key: string]: any
}

export const AutocompleteInput = ({ suggestions = [], ...props }: AutocompleteInputProps) => {
  const [field, meta, helpers] = useField(props)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)

  useEffect(() => {
    if (field.value && typeof field.value === 'string' && field.value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(field.value.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [field.value, suggestions])

  const handleSuggestionClick = (value: string) => {
    helpers.setValue(value)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Arrow down/up and enter key support
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestion(prev => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        helpers.setValue(filteredSuggestions[activeSuggestion])
        setShowSuggestions(false)
      }
    }
  }

  return (
    <div className="relative">
      <Field
        type="text"
        autoComplete="off"
        {...field}
        {...props}
        component={Input}
        onKeyDown={handleKeyDown}
      />
      {meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                index === activeSuggestion ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}