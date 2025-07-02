import request from 'supertest'
import { Express } from 'express'
import { UserRepository } from '../../src/api/v1/repositories/user.repository'
import { RefreshTokenRepository } from '../../src/api/v1/repositories/refreshToken.repository'
import { testUserData } from '../mock/testUserData'
import { BcryptServices } from '../../src/api/v1/utils/bcrypt.util'
import { TestHelper } from '../setup/test-helper'

describe('Register route test', () => {
  let app: Express
  let userRepository: UserRepository
  let refreshTokenRepository: RefreshTokenRepository

  beforeAll(() => {
    app = TestHelper.getApp()
    userRepository = new UserRepository()
    refreshTokenRepository = new RefreshTokenRepository()
  })

  // Helper function to generate unique email
  const generateUniqueEmail = () => `test${Date.now()}${Math.random().toString(36)}@example.com`

  describe('success case', () => {
    it('Register user successfully with valid data', async () => {
      // Arrange - Use unique email
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Assert Response Structure
      expect(response.body).toHaveProperty('status', 'success')
      expect(response.body).toHaveProperty('statusCode', 201)
      expect(response.body).toHaveProperty('message', 'User register successfully')
      expect(response.body).toHaveProperty('data')

      // Assert User Data
      const { user, tokens } = response.body.data
      expect(user).toHaveProperty('_id')
      expect(user).toHaveProperty('email', userData.email.toLowerCase())
      expect(user).toHaveProperty('firstName', userData.firstName)
      expect(user).toHaveProperty('lastName', userData.lastName)
      expect(user).toHaveProperty('role', 'customer')
      expect(user).toHaveProperty('status', 'active')
      expect(user).toHaveProperty('isEmailVerified', false)

      // Should NOT return sensitive data
      expect(user).not.toHaveProperty('password')
      expect(user).not.toHaveProperty('emailVerificationToken')
      expect(user).not.toHaveProperty('passwordResetToken')

      // Assert Tokens
      expect(tokens).toHaveProperty('accessToken')
      expect(tokens).toHaveProperty('refreshToken')
      expect(TestHelper.isValidJWT(tokens.accessToken)).toBe(true)
      expect(TestHelper.isValidJWT(tokens.refreshToken)).toBe(true)
    })

    it('should register user with minimal required fields', async () => {
      // Arrange - Use unique email
      const userData = {
        ...testUserData.validMinimal,
        email: generateUniqueEmail()
      }

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      expect(response.body.data.user.email).toBe(userData.email.toLowerCase())
      expect(response.body.data.user.firstName).toBe(userData.firstName)
      expect(response.body.data.user.lastName).toBe(userData.lastName)
      expect(response.body.data.user.gender).toBe('other') // default value
    })

    it('should save refresh token in database', async () => {
      // Arrange - Use unique email
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      const userId = response.body.data.user._id
      const refreshToken = response.body.data.tokens.refreshToken

      const storedToken = await refreshTokenRepository.findActiveToken(userId, refreshToken)
      expect(storedToken).toBeTruthy()
      expect(storedToken!.isActive).toBe(true)
      expect(storedToken!.token).toBe(refreshToken)
    })

    it('should handle email case insensitivity', async () => {
      // Arrange - Use unique email
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail.toUpperCase()
      }

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      expect(response.body.data.user.email).toBe(uniqueEmail.toLowerCase())
    })
  })

  describe('❌ Validation Error Cases (422)', () => {
    it('should return 422 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(422)

      expect(response.body).toHaveProperty('status', 'error')
      expect(response.body).toHaveProperty('statusCode', 422)
      expect(response.body).toHaveProperty('errorType', 'VALIDATION_ERROR')
    })

    it('should return 422 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(422)

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.email',
          message: 'Email is required'
        })
      )
    })

    it('should return 422 for password too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: generateUniqueEmail(),
          password: '123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(422)

      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.password',
          message: 'Password length must be from 6 to 50'
        })
      )
    })
  })

  describe('❌ Business Logic Error Cases', () => {
    it('should return 409 when email already exists', async () => {
      // Arrange - Create user first with unique email
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail
      }

      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Act - Try to register same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409)

      // Assert
      expect(response.body).toHaveProperty('status', 'error')
      expect(response.body).toHaveProperty('statusCode', 409)
      expect(response.body).toHaveProperty('errorType', 'CONFLICT')
      expect(response.body).toHaveProperty('message', 'Email already exists')
    })
  })

  describe('🔒 Security Tests', () => {
    it('should not return password in response', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.user).not.toHaveProperty('password')

      // Verify password is not in any nested objects
      const responseString = JSON.stringify(response.body)
      expect(responseString).not.toContain(userData.password)
    })

    it('should generate valid JWT tokens', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      const { accessToken, refreshToken } = response.body.data.tokens

      // Verify token format
      expect(accessToken.split('.')).toHaveLength(3)
      expect(refreshToken.split('.')).toHaveLength(3)

      // Verify tokens contain user ID
      const accessTokenUserId = TestHelper.extractUserIdFromToken(accessToken)
      const refreshTokenUserId = TestHelper.extractUserIdFromToken(refreshToken)

      expect(accessTokenUserId).toBe(response.body.data.user._id)
      expect(refreshTokenUserId).toBe(response.body.data.user._id)
    })
  })
})