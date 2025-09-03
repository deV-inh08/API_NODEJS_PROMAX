// __tests__/integration/auth/register.integration.test.ts
import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '~/index'
import { testUserData } from '../../mock/testUserData'
import { userSchema } from '~/api/v1/models/users.model'
import { refreshTokenModelSchema } from '~/api/v1/models/refreshtoken.model'
import { IUser } from '~/api/v1/types/user.type'

describe('Register API - Integration Tests', () => {
  let UserModel: mongoose.Model<IUser>
  let RefreshTokenModel: mongoose.Model<any>

  beforeAll(() => {
    // Get models from real database connection
    UserModel = mongoose.connection.model('User', userSchema)
    RefreshTokenModel = mongoose.connection.model('RefreshToken', refreshTokenModelSchema)

    console.log('🔗 Register Integration Tests - Using Real Database')
    console.log('Database Name:', mongoose.connection.db?.databaseName)
  })

  // Helper function to generate unique email
  const generateUniqueEmail = () => `integration-${Date.now()}-${Math.random().toString(36)}@example.com`

  // Helper to verify data in database with null check
  const verifyUserInDatabase = async (email: string) => {
    const user = await UserModel.findOne({ email }).lean()
    return user
  }

  // Helper with assertion for TypeScript
  const getUserFromDatabase = async (email: string): Promise<any> => {
    const user = await UserModel.findOne({ email }).lean()
    if (!user) {
      throw new Error(`User with email ${email} not found in database`)
    }
    return user
  }

  const verifyRefreshTokenInDatabase = async (userId: string) => {
    const tokens = await RefreshTokenModel.find({ userId, isActive: true }).lean()
    return tokens
  }

  // Helper to get single refresh token
  const getRefreshTokenFromDatabase = async (token: string) => {
    const refreshToken = await RefreshTokenModel.findOne({ token }).lean()
    if (!refreshToken) {
      throw new Error(`Refresh token not found in database`)
    }
    return refreshToken
  }

  describe('✅ Success Cases - Database Integration', () => {
    it('should register user successfully and persist to database', async () => {
      // Arrange
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      // Act
      const response = await request(app).post('/api/v1/auth/register').send(userData)
      // .expect(201) // Comment out temporarily to see error

      // Debug: Log response if error
      if (response.status !== 201) {
        console.log('❌ API Error Response:', {
          status: response.status,
          body: response.body,
          headers: response.headers
        })
      }

      // Assert API Response
      expect(response.status).toBe(201)

      // Assert API Response
      expect(response.body).toHaveProperty('status', 'success')
      expect(response.body).toHaveProperty('statusCode', 201)
      expect(response.body).toHaveProperty('message', 'User register successfully')

      const { user, tokens } = response.body.data
      console.log('user', user)
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email', userData.email.toLowerCase())
      expect(user).toHaveProperty('firstName', userData.firstName)
      expect(user).toHaveProperty('lastName', userData.lastName)
      expect(user).toHaveProperty('phoneNumber', userData.phoneNumber)
      expect(user).toHaveProperty('gender', userData.gender)
      expect(user).toHaveProperty('role', 'customer')
      expect(user).toHaveProperty('status', 'active')
      expect(user).toHaveProperty('isEmailVerified', false)

      // Should NOT return sensitive data
      expect(user).not.toHaveProperty('password')

      // Assert Tokens
      expect(tokens).toHaveProperty('accessToken')
      expect(tokens).toHaveProperty('refreshToken')

      // 🔍 DATABASE VERIFICATION
      const dbUser = await getUserFromDatabase(userData.email.toLowerCase())
      console.log('dbUser', dbUser)
      expect(dbUser._id.toString()).toBe(user.id)
      expect(dbUser.email).toBe(userData.email.toLowerCase())
      expect(dbUser.firstName).toBe(userData.firstName)
      expect(dbUser.lastName).toBe(userData.lastName)
      expect(dbUser.phoneNumber).toBe(userData.phoneNumber)
      expect(dbUser.gender).toBe(userData.gender)
      expect(dbUser.role).toBe('customer')
      expect(dbUser.status).toBe('active')
      expect(dbUser.isEmailVerified).toBe(false)
      expect(dbUser.isPhoneVerified).toBe(false)

      // Verify password is hashed (not plain text)
      expect(dbUser.password).toBeTruthy()
      expect(dbUser.password).not.toBe(userData.password)
      expect(dbUser.password.length).toBeGreaterThan(50) // Bcrypt hash length
      expect(dbUser.password).toMatch(/^\$2[aby]\$/) // Bcrypt hash pattern

      // Verify default values
      expect(dbUser.totalOrders).toBe(0)
      expect(dbUser.totalSpent).toBe(0)
      expect(dbUser.cart).toEqual([])
      expect(dbUser.wishList).toEqual([])
      expect(dbUser.address).toEqual([])

      // Note: User schema doesn't have timestamps enabled, so we skip timestamp checks

      // 🔍 REFRESH TOKEN VERIFICATION
      const dbTokens = await verifyRefreshTokenInDatabase(user.id)
      expect(dbTokens).toHaveLength(1)

      const dbToken = dbTokens[0]
      expect(dbToken.token).toBe(tokens.refreshToken)
      expect(dbToken.isActive).toBe(true)
      expect(dbToken.userId.toString()).toBe(user.id)
      expect(dbToken.exp).toBeInstanceOf(Date)
      expect(dbToken.iat).toBeInstanceOf(Date)
      expect(dbToken.exp > new Date()).toBe(true) // Token not expired
      expect(dbToken.deviceInfo).toBeDefined()
    })

    it('should register user with minimal fields and set correct defaults', async () => {
      const userData = {
        ...testUserData.validMinimal,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      expect(response.body.data.user.email).toBe(userData.email.toLowerCase())
      expect(response.body.data.user.gender).toBe('other') // default value

      // 🔍 DATABASE VERIFICATION - Defaults
      const dbUser = await getUserFromDatabase(userData.email.toLowerCase())
      expect(dbUser.gender).toBe('other')
      expect(dbUser.phoneNumber).toBeUndefined()
      expect(dbUser.role).toBe('customer')
      expect(dbUser.status).toBe('active')
      expect(dbUser.isEmailVerified).toBe(false)
      expect(dbUser.isPhoneVerified).toBe(false)
      expect(dbUser.totalOrders).toBe(0)
      expect(dbUser.totalSpent).toBe(0)
      expect(dbUser.cart).toEqual([])
      expect(dbUser.wishList).toEqual([])
      expect(dbUser.address).toEqual([])

      // Verify required fields
      expect(dbUser.firstName).toBe(userData.firstName)
      expect(dbUser.lastName).toBe(userData.lastName)
      expect(dbUser.password).toBeTruthy()
    })

    it('should handle email case insensitivity in database', async () => {
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail.toUpperCase()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      expect(response.body.data.user.email).toBe(uniqueEmail.toLowerCase())

      // 🔍 DATABASE VERIFICATION - Case Sensitivity
      const dbUser = await getUserFromDatabase(uniqueEmail.toLowerCase())
      expect(dbUser.email).toBe(uniqueEmail.toLowerCase())

      // Since the schema has lowercase: true and unique: true, MongoDB creates a case-insensitive unique index
      // This means searching with uppercase will still find the lowercase stored value
      const upperCaseUser = await UserModel.findOne({ email: uniqueEmail.toUpperCase() }).lean()
      expect(upperCaseUser).toBeTruthy() // Should find the user due to case-insensitive index
      expect(upperCaseUser?.email).toBe(uniqueEmail.toLowerCase()) // But stored value is lowercase

      // Verify case-insensitive search works
      const caseInsensitiveUser = await UserModel.findOne({
        email: { $regex: new RegExp(`^${uniqueEmail}$`, 'i') }
      }).lean()
      expect(caseInsensitiveUser).toBeTruthy()
      if (caseInsensitiveUser) {
        expect(caseInsensitiveUser.email).toBe(uniqueEmail.toLowerCase())
      }
    })
  })

  describe('❌ Validation Error Cases - Database Constraints', () => {
    it('should return 422 for invalid email format without touching database', async () => {
      const initialUserCount = await UserModel.countDocuments()
      const initialTokenCount = await RefreshTokenModel.countDocuments()

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

      // 🔍 DATABASE VERIFICATION - No Changes
      const finalUserCount = await UserModel.countDocuments()
      const finalTokenCount = await RefreshTokenModel.countDocuments()
      expect(finalUserCount).toBe(initialUserCount)
      expect(finalTokenCount).toBe(initialTokenCount)
    })

    it('should return 422 for password too short without database insertion', async () => {
      const initialUserCount = await UserModel.countDocuments()
      const initialTokenCount = await RefreshTokenModel.countDocuments()

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

      // 🔍 DATABASE VERIFICATION - No Changes
      const finalUserCount = await UserModel.countDocuments()
      const finalTokenCount = await RefreshTokenModel.countDocuments()
      expect(finalUserCount).toBe(initialUserCount)
      expect(finalTokenCount).toBe(initialTokenCount)
    })

    it('should return 422 for missing required fields', async () => {
      const initialUserCount = await UserModel.countDocuments()

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: generateUniqueEmail(),
          password: 'password123'
          // Missing firstName and lastName
        })
        .expect(422)

      expect(response.body).toHaveProperty('errorType', 'VALIDATION_ERROR')
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.firstName',
            message: 'firstName  is required'
          }),
          expect.objectContaining({
            path: 'body.lastName',
            message: 'last name  is required'
          })
        ])
      )

      // 🔍 DATABASE VERIFICATION
      const finalUserCount = await UserModel.countDocuments()
      expect(finalUserCount).toBe(initialUserCount)
    })

    it('should return 422 for invalid phone number format', async () => {
      const initialUserCount = await UserModel.countDocuments()

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...testUserData.invalid.phoneInvalid,
          email: generateUniqueEmail()
        })
        .expect(422)

      expect(response.body).toHaveProperty('errorType', 'VALIDATION_ERROR')

      // 🔍 DATABASE VERIFICATION
      const finalUserCount = await UserModel.countDocuments()
      expect(finalUserCount).toBe(initialUserCount)
    })
  })

  describe('❌ Business Logic Error Cases - Database Uniqueness', () => {
    it('should return 409 when email already exists in database', async () => {
      const uniqueEmail = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email: uniqueEmail
      }

      // Create user first
      await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Verify user exists in database
      const firstUser = await verifyUserInDatabase(uniqueEmail)
      expect(firstUser).toBeTruthy()

      const initialUserCount = await UserModel.countDocuments()
      const initialTokenCount = await RefreshTokenModel.countDocuments()

      // Try to register same email
      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(409)

      expect(response.body).toHaveProperty('status', 'error')
      expect(response.body).toHaveProperty('statusCode', 409)
      expect(response.body).toHaveProperty('errorType', 'CONFLICT')
      expect(response.body).toHaveProperty('message', 'Email already exists')

      // 🔍 DATABASE VERIFICATION - No Duplicates
      const finalUserCount = await UserModel.countDocuments()
      const finalTokenCount = await RefreshTokenModel.countDocuments()

      expect(finalUserCount).toBe(initialUserCount)
      expect(finalTokenCount).toBe(initialTokenCount)

      // Verify still only one user with this email
      const users = await UserModel.find({ email: uniqueEmail }).lean()
      expect(users).toHaveLength(1)
    })

    it('should handle case-insensitive email uniqueness', async () => {
      const baseEmail = generateUniqueEmail()
      const userData1 = {
        ...testUserData.valid,
        email: baseEmail.toLowerCase()
      }
      const userData2 = {
        ...testUserData.valid,
        email: baseEmail.toUpperCase(),
        firstName: 'Different',
        lastName: 'User'
      }

      // Register with lowercase email
      await request(app).post('/api/v1/auth/register').send(userData1).expect(201)

      // Try to register with uppercase email (should fail)
      const response = await request(app).post('/api/v1/auth/register').send(userData2).expect(409)

      expect(response.body.message).toBe('Email already exists')

      // 🔍 DATABASE VERIFICATION - Case Insensitive Uniqueness
      const users = await UserModel.find({
        email: { $regex: new RegExp(`^${baseEmail}$`, 'i') }
      }).lean()
      expect(users).toHaveLength(1)
      expect(users[0].email).toBe(baseEmail.toLowerCase())
    })
  })

  describe('🔒 Security Tests - Database Security', () => {
    it('should not store plain password in database', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // API should not return password
      expect(response.body.data.user).not.toHaveProperty('password')

      // Verify password is not in any nested objects
      const responseString = JSON.stringify(response.body)
      expect(responseString).not.toContain(userData.password)

      // 🔍 DATABASE SECURITY VERIFICATION
      const dbUser = await UserModel.findById(response.body.data.user.id).lean()

      // Password should be hashed, not plain text
      if (dbUser) {
        expect(dbUser.password).toBeTruthy()
        expect(dbUser.password).not.toBe(userData.password)
        expect(dbUser.password).toMatch(/^\$2[aby]\$/) // Bcrypt hash pattern
        expect(dbUser.password.length).toBeGreaterThan(50)
      }

      // Verify other sensitive fields are not exposed in API
      expect(response.body.data.user).not.toHaveProperty('emailVerificationToken')
      expect(response.body.data.user).not.toHaveProperty('passwordResetToken')
      expect(response.body.data.user).not.toHaveProperty('passwordExpires')
    })

    it('should generate valid JWT tokens and store refresh token securely', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      const { accessToken, refreshToken } = response.body.data.tokens

      // Verify token format (JWT: header.payload.signature)
      expect(accessToken.split('.')).toHaveLength(3)
      expect(refreshToken.split('.')).toHaveLength(3)

      // 🔍 DATABASE TOKEN VERIFICATION
      const dbTokens = await RefreshTokenModel.find({
        userId: response.body.data.user.id
      }).lean()

      expect(dbTokens).toHaveLength(1)

      const dbToken = dbTokens[0]
      expect(dbToken.token).toBe(refreshToken)
      expect(dbToken.isActive).toBe(true)
      expect(dbToken.userId.toString()).toBe(response.body.data.user.id)
      expect(dbToken.exp).toBeInstanceOf(Date)
      expect(dbToken.iat).toBeInstanceOf(Date)
      expect(dbToken.exp > dbToken.iat).toBe(true)

      // Verify token expires in the future (30 days from now)
      expect(dbToken.exp > new Date()).toBe(true)

      // Verify device info is captured (may be undefined in test environment)
      expect(dbToken.deviceInfo).toBeDefined()
      // Note: deviceInfo.userAgent and deviceInfo.ip may be undefined in test environment
      // so we don't assert their specific values
    })

    it('should not expose sensitive database fields in API response', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      const user = response.body.data.user

      // Fields that should NOT be in API response
      const sensitiveFields = [
        'password',
        'emailVerificationToken',
        'emailVerificationExpires',
        'passwordResetToken',
        'passwordExpires',
        '__v'
      ]

      sensitiveFields.forEach((field) => {
        expect(user).not.toHaveProperty(field)
      })

      // Verify these fields exist in database but not in response
      const dbUser = await UserModel.findById(user.id).lean()
      if (dbUser) {
        expect(dbUser.password).toBeTruthy()
        expect(Object.keys(dbUser)).toContain('password')
      }
    })
  })

  describe('📊 Database State and Statistics', () => {
    it('should correctly initialize user statistics and arrays', async () => {
      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      const dbUser = await getUserFromDatabase(userData.email.toLowerCase())

      // Verify initial statistics
      expect(dbUser.totalOrders).toBe(0)
      expect(dbUser.totalSpent).toBe(0)

      // Verify empty arrays
      expect(dbUser.cart).toEqual([])
      expect(dbUser.wishList).toEqual([])
      expect(dbUser.address).toEqual([])

      // Verify boolean defaults
      expect(dbUser.isEmailVerified).toBe(false)
      expect(dbUser.isPhoneVerified).toBe(false)

      // Note: User schema doesn't have timestamps enabled, so we skip timestamp checks

      // Verify social accounts object
      expect(dbUser.socialAccounts).toBeDefined()
      expect(typeof dbUser.socialAccounts).toBe('object')
    })

    it('should maintain database consistency after registration', async () => {
      const initialUserCount = await UserModel.countDocuments()
      const initialTokenCount = await RefreshTokenModel.countDocuments()

      const userData = {
        ...testUserData.valid,
        email: generateUniqueEmail()
      }

      const response = await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Verify counts increased by exactly 1
      const finalUserCount = await UserModel.countDocuments()
      const finalTokenCount = await RefreshTokenModel.countDocuments()

      expect(finalUserCount).toBe(initialUserCount + 1)
      expect(finalTokenCount).toBe(initialTokenCount + 1)

      // Verify relationship between user and token
      const userId = response.body.data.user.id
      const userTokens = await RefreshTokenModel.find({ userId }).lean()
      expect(userTokens).toHaveLength(1)
      expect(userTokens[0].token).toBe(response.body.data.tokens.refreshToken)
    })

    it('should handle database indexes and constraints properly', async () => {
      const email = generateUniqueEmail()
      const userData = {
        ...testUserData.valid,
        email
      }

      // First registration should succeed
      await request(app).post('/api/v1/auth/register').send(userData).expect(201)

      // Verify user exists
      const dbUser = await UserModel.findOne({ email }).lean()
      expect(dbUser).toBeTruthy()

      // Try to create duplicate manually (should fail due to unique index)
      const duplicateUser = new UserModel({
        ...userData,
        email // Use the same email
      })

      let duplicateError: any
      try {
        await duplicateUser.save()
      } catch (error) {
        duplicateError = error
      }

      // Should fail due to unique constraint
      expect(duplicateError).toBeTruthy()
      expect(duplicateError.code).toBe(11000) // MongoDB duplicate key error
    })
  })

  describe('🔄 Database Operations and Performance', () => {
    it('should handle multiple concurrent registrations', async () => {
      // Create multiple unique users concurrently
      const userPromises = Array(5)
        .fill(null)
        .map((_, index) => {
          const userData = {
            ...testUserData.valid,
            email: `concurrent-${index}-${generateUniqueEmail()}`,
            firstName: `User${index}`
          }

          return request(app).post('/api/v1/auth/register').send(userData).expect(201)
        })

      const responses = await Promise.all(userPromises)

      // Verify all registrations succeeded
      expect(responses).toHaveLength(5)
      responses.forEach((response) => {
        expect(response.body.status).toBe('success')
        expect(response.body.data.user).toBeDefined()
        expect(response.body.data.tokens).toBeDefined()
      })

      // Verify all users exist in database
      const userIds = responses.map((r) => r.body.data.user.id)
      const dbUsers = await UserModel.find({ _id: { $in: userIds } }).lean()
      expect(dbUsers).toHaveLength(5)

      // Verify all tokens exist
      const dbTokens = await RefreshTokenModel.find({ userId: { $in: userIds } }).lean()
      expect(dbTokens).toHaveLength(5)
    })

    it('should properly cleanup on failed registration', async () => {
      const initialUserCount = await UserModel.countDocuments()
      const initialTokenCount = await RefreshTokenModel.countDocuments()

      // Try to register with invalid data
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email-format',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(422)

      // Verify no partial data was left in database
      const finalUserCount = await UserModel.countDocuments()
      const finalTokenCount = await RefreshTokenModel.countDocuments()

      expect(finalUserCount).toBe(initialUserCount)
      expect(finalTokenCount).toBe(initialTokenCount)
    })
  })
})
