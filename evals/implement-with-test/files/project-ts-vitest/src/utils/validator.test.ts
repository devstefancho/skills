import { describe, it, expect } from 'vitest'
import { isValidEmail, isNonEmptyString } from './validator'

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('returns false for invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })
})

describe('isNonEmptyString', () => {
  it('returns true for non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false)
  })

  it('returns false for non-string', () => {
    expect(isNonEmptyString(42)).toBe(false)
  })
})
