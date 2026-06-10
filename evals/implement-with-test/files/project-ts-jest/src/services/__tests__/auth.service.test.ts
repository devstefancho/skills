import { AuthService } from '../auth.service'

describe('AuthService', () => {
  const authService = new AuthService()

  describe('hashPassword', () => {
    it('should return a hashed string', async () => {
      const hash = await authService.hashPassword('password123')
      expect(hash).toBeDefined()
      expect(hash).not.toBe('password123')
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const hash = await authService.hashPassword('password123')
      const result = await authService.verifyPassword('password123', hash)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const hash = await authService.hashPassword('password123')
      const result = await authService.verifyPassword('wrong', hash)
      expect(result).toBe(false)
    })
  })
})
