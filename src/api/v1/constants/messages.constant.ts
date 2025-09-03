export const UserMessage = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',

  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50',

  NEW_PASSWORD_IS_REQUIRED: 'New password is required',
  NEW_PASSWORD_MUST_BE_A_STRING: 'new password must be a string',
  NEW_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'New password length must be from 6 to 50',

  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50',

  FIRST_NAME_IS_REQUIRED: 'firstName  is required',
  FIRST_NAME_LENGTH_MUST_BE_FROM_6_TO_50: 'first name length must be from 6 to 50',

  LAST_NAME_IS_REQUIRED: 'last name  is required',
  LAST_NAME_LENGTH_MUST_BE_FROM_6_TO_50: 'last name length must be from 6 to 50',

  PHONE_NUMBER_INVALID: 'Số điện thoại không hợp lệ',
  DATE_OF_BIRTH_INVALID: 'Date of birth invalid'
} as const

export const ErrorMessage = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized'
} as const
