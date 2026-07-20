'use client'

import { useCallback, useState, type FormEvent } from 'react'

type FieldEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

// Retrofits app-styled inline validation onto native <form required> fields
// without making every input controlled — reads invalid field names off the
// DOM via the browser's own constraint validation at submit time. validate/clear
// are stable references (useCallback) so callers can safely depend on them in
// a useEffect (e.g. clearing errors when a modal switches) without looping.
export function useFormValidation() {
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())

  const validate = useCallback((form: HTMLFormElement): boolean => {
    const invalid = new Set<string>()
    for (const el of Array.from(form.elements)) {
      const field = el as FieldEl
      if (field.name && typeof field.checkValidity === 'function' && !field.checkValidity()) {
        invalid.add(field.name)
      }
    }
    setInvalidFields(invalid)
    return invalid.size === 0
  }, [])

  const clear = useCallback(() => setInvalidFields(new Set()), [])

  // Wire onInput={onFieldInput} on the <form> (bubbles from any field) so a
  // field's red border/error clears the moment the user fixes it, rather than
  // only at the next full submit attempt.
  const onFieldInput = useCallback((e: FormEvent<HTMLFormElement>) => {
    const field = e.target as FieldEl
    if (field.name && typeof field.checkValidity === 'function' && field.checkValidity()) {
      setInvalidFields(prev => {
        if (!prev.has(field.name)) return prev
        const next = new Set(prev)
        next.delete(field.name)
        return next
      })
    }
  }, [])

  return { invalidFields, validate, clear, onFieldInput }
}
