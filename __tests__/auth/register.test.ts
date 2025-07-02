import request from 'supertest'
import { Express } from 'express'
import { UserRepository } from '../../src/api/v1/repositories/user.repository'
import { RefreshTokenRepository } from '../../src/api/v1/repositories/refreshToken.repository'
import { TestHelper } from '../setup/testHelper.test'
import { testUserData } from '../mock/testUserData'
import { BcryptServices } from '../../src/api/v1/utils/bcrypt.util'
import { isMapIterator } from 'util/types'

describe('Register route test', () => {
  let app: Express
  let userRepository: UserRepository
  let refreshTokenRepository: RefreshTokenRepository

  beforeAll(() => {
    app = TestHelper.getApp()
    userRepository = new UserRepository()
    refreshTokenRepository = new RefreshTokenRepository()
  })

  describe('success case', () => {
    it('Register user successfully with valid data', async () => {
      // Arrange
      const userData = testUserData.valid

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

      // Verify user created in database
      const dbUser = await userRepository.checkUserIsExists(userData.email)
      expect(dbUser).toBeTruthy()
      expect(dbUser!.email).toBe(userData.email.toLowerCase())

      // Verify password is hashed
      const isPasswordHashed = await BcryptServices.comparePassword(
        userData.password,
        dbUser!.password
      )
      expect(isPasswordHashed).toBe(true)
    })

    it('should register user with minimal required fields', async () => {
      // Arrange
      const userData = testUserData.validMinimal

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
      // Arrange
      const userData = testUserData.valid

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
      // Arrange
      const userData = {
        ...testUserData.valid,
        email: 'TEST@EXAMPLE.COM'
      }

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      expect(response.body.data.user.email).toBe('test@example.com')
    })
  })

  describe('❌ Validation Error Cases (422)', () => {
    it('should return 422 for invalid email format', async () => {
      // Arrange
      const userData = testUserData.invalid.emailInvalid

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body).toHaveProperty('status', 'error')
      expect(response.body).toHaveProperty('statusCode', 422)
      expect(response.body).toHaveProperty('errorType', 'VALIDATION_ERROR')
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.email',
          message: 'Email is invalid'
        })
      )
    })

    it('should return 422 for missing email', async () => {
      // Arrange
      const userData = testUserData.invalid.emailMissing

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.email',
          message: 'Email is required'
        })
      )
    })

    it('should return 422 for password too short', async () => {
      // Arrange
      const userData = testUserData.invalid.passwordShort

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.password',
          message: 'Password length must be from 6 to 50'
        })
      )
    })

    it('should return 422 for password too long', async () => {
      // Arrange
      const userData = testUserData.invalid.passwordLong

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.password',
          message: 'Password length must be from 6 to 50'
        })
      )
    })

    it('should return 422 for missing firstName', async () => {
      // Arrange
      const userData = testUserData.invalid.firstNameMissing

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.firstName',
          message: 'firstName  is required'
        })
      )
    })

    it('should return 422 for firstName too short', async () => {
      // Arrange
      const userData = testUserData.invalid.firstNameShort

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.firstName',
          message: 'first name length must be from 6 to 50'
        })
      )
    })

    it('should return 422 for missing lastName', async () => {
      // Arrange
      const userData = testUserData.invalid.lastNameMissing

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.lastName',
          message: 'last name  is required'
        })
      )
    })

    it('should return 422 for invalid phone number', async () => {
      // Arrange
      const userData = testUserData.invalid.phoneInvalid

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          path: 'body.phoneNumber',
          message: 'Số điện thoại không hợp lệ'
        })
      )
    })

    it('should handle multiple validation errors', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: '123',
        firstName: 'J'
      }

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(422)

      // Assert
      expect(response.body.details).toHaveLength(4) // email, password, firstName, lastName
      expect(response.body.details).toContainEqual(
        expect.objectContaining({ path: 'body.email' })
      )
      expect(response.body.details).toContainEqual(
        expect.objectContaining({ path: 'body.password' })
      )
      expect(response.body.details).toContainEqual(
        expect.objectContaining({ path: 'body.firstName' })
      )
      expect(response.body.details).toContainEqual(
        expect.objectContaining({ path: 'body.lastName' })
      )
    })
  })

  describe('❌ Business Logic Error Cases', () => {
    it('should return 409 when email already exists', async () => {
      // Arrange - Create user first
      const userData = testUserData.valid
      await TestHelper.createTestUser(userData)

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

    it('should return 409 for case insensitive email conflict', async () => {
      // Arrange - Create user with lowercase email
      const userData = testUserData.valid
      await TestHelper.createTestUser(userData)

      // Act - Try to register with uppercase email
      const conflictData = {
        ...userData,
        email: userData.email.toUpperCase()
      }

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(conflictData)
        .expect(409)

      // Assert
      expect(response.body.message).toBe('Email already exists')
    })
  })

  describe('🔒 Security Tests', () => {
    it('should not return password in response', async () => {
      // Arrange
      const userData = testUserData.valid

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      expect(response.body.data.user).not.toHaveProperty('password')

      // Verify password is not in any nested objects
      const responseString = JSON.stringify(response.body)
      expect(responseString).not.toContain(userData.password)
    })

    it('should hash password before storing', async () => {
      // Arrange
      const userData = testUserData.valid

      // Act
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      const dbUser = await userRepository.checkUserIsExists(userData.email)
      expect(dbUser!.password).not.toBe(userData.password)
      expect(dbUser!.password).toMatch(/^\$2[aby]\$/) // bcrypt hash format
    })

    it('should generate valid JWT tokens', async () => {
      // Arrange
      const userData = testUserData.valid

      // Act
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
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

  describe('🚀 Performance Tests', () => {
    it('should complete registration within reasonable time', async () => {
      // Arrange
      const userData = testUserData.valid
      const startTime = Date.now()

      // Act
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201)

      // Assert
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
