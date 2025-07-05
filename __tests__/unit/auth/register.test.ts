// __tests__/auth/register.test.ts
import request from 'supertest'
import { Express } from 'express'
import { testUserData } from '../../mock/testUserData'
import { TestHelper } from '../helper/test-helper'
import { getUserModel } from '../models/simple-model'

describe('Register API - Unit Tests', () => {
  let app: Express

  beforeAll(() => {
    app = TestHelper.getApp()

    console.log('🧪 Register Tests - Using Memory Server')
  })

  // Helper function to generate unique email
  const generateUniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36)}@example.com`

  describe('✅ Success Cases', () => {
    it('should register user successfully with valid data', async () => {
      // Arrange
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      // Act
      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Assert Response Structure
      expect(response.body).toHaveProperty('status', 'success')
      expect(response.body).toHaveProperty('statusCode', 201)
      expect(response.body).toHaveProperty('message', 'User register successfully')

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

      // Assert Tokens
      expect(tokens).toHaveProperty('accessToken')
      expect(tokens).toHaveProperty('refreshToken')
      expect(TestHelper.isValidJWT(tokens.accessToken)).toBe(true)
      expect(TestHelper.isValidJWT(tokens.refreshToken)).toBe(true)

    })

    it('should register user with minimal required fields', async () => {
      const userData = {
        ...testUserData.validMinimal,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      expect(response.body.data.user.email).toBe(userData.email.toLowerCase())
      expect(response.body.data.user.gender).toBe('other') // default value
    })

    it('should handle email case insensitivity', async () => {
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail.toUpperCase()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

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

    it('should return 422 for password too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: generateUniqueEmail(),
          password: '123', // Too short
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
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail
      }

      // Create user first
      await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Try to register same email
      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(409)

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

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

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

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

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
