// Test data fixtures
export const testUserData = {
  valid: {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    gender: 'male' as const
  },

  validMinimal: {
    email: 'minimal@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith'
  },

  invalid: {
    emailInvalid: {
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    },

    emailMissing: {
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    } as any,

    passwordShort: {
      email: 'test@example.com',
      password: '123',
      firstName: 'John',
      lastName: 'Doe'
    },

    passwordLong: {
      email: 'test@example.com',
      password: 'a'.repeat(51),
      firstName: 'John',
      lastName: 'Doe'
    },

    firstNameMissing: {
      email: 'test@example.com',
      password: 'password123',
      lastName: 'Doe'
    } as any,

    firstNameShort: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'J',
      lastName: 'Doe'
    },

    lastNameMissing: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John'
    } as any,

    phoneInvalid: {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: 'invalid-phone'
    }
  }
}