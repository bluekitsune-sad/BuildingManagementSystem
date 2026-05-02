import { useState, useCallback } from 'react'

export function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  validate,
  placeholder,
  required,
  maxLength,
  min,
  max,
  step,
  className = '',
}) {
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const handleChange = useCallback((e) => {
    const val = e.target.value
    onChange(e)
    if (touched && validate) {
      const err = validate(val)
      setError(err || '')
    }
  }, [onChange, touched, validate])

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (validate) {
      const err = validate(value)
      setError(err || '')
    }
  }, [validate, value])

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm text-soft">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        className={`input-field ${
          touched && error ? 'border-red-400 focus:border-red-400' : ''
        }`}
      />
      {touched && error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export function ValidatedSelect({
  label,
  name,
  value,
  onChange,
  options,
  validate,
  required,
  className = '',
}) {
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const handleChange = useCallback((e) => {
    onChange(e)
    if (touched && validate) {
      const err = validate(e.target.value)
      setError(err || '')
    }
  }, [onChange, touched, validate])

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (validate) {
      const err = validate(value)
      setError(err || '')
    }
  }, [validate, value])

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm text-soft">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        className={`input-field ${
          touched && error ? 'border-red-400 focus:border-red-400' : ''
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {touched && error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}
