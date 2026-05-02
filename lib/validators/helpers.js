export function required(label, value, errorsObj) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    errorsObj[label.toLowerCase()] = `${label} is required`
  }
}

export function maxLength(label, value, max, errorsObj) {
  if (value && value.length > max) {
    errorsObj[label.toLowerCase()] = `${label} must be under ${max} characters`
  }
}

export function categoryWithOthers(category, otherValue, errorsObj) {
  if (category === 'others' && (!otherValue || !otherValue.trim())) {
    errorsObj.otherCategory = 'Category name is required when "Others" is selected'
  }
}

export const validators = {
  required: (msg = 'This field is required') => (val) => {
    if (!val || (typeof val === 'string' && !val.trim())) return msg
    return ''
  },

  minLength: (min, msg) => (val) => {
    if (!val) return ''
    if (val.length < min) return msg || `Must be at least ${min} characters`
    return ''
  },

  maxLength: (max, msg) => (val) => {
    if (!val) return ''
    if (val.length > max) return msg || `Must be under ${max} characters`
    return ''
  },

  email: (msg = 'Invalid email') => (val) => {
    if (!val) return ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return msg
    return ''
  },

  minNumber: (min, msg) => (val) => {
    if (!val) return ''
    const num = parseFloat(val)
    if (isNaN(num) || num < min) return msg || `Must be at least ${min}`
    return ''
  },

  maxNumber: (max, msg) => (val) => {
    if (!val) return ''
    const num = parseFloat(val)
    if (isNaN(num) || num > max) return msg || `Cannot exceed ${max}`
    return ''
  },

  positiveNumber: (msg = 'Must be a positive number') => (val) => {
    if (!val) return ''
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0) return msg
    return ''
  },

  chain: (...validators) => (val) => {
    for (const v of validators) {
      const err = v(val)
      if (err) return err
    }
    return ''
  },
}
