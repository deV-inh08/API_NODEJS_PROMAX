import admin from 'firebase-admin'
import envConfig from '~/api/v1/config/env.config'
import { BadRequestError, UnauthorizedError } from '~/api/v1/utils/response.util'

// Initialize Firebase Admin (chỉ 1 lần)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: envConfig.FIREBASE_PROJECT_ID,
        clientEmail: envConfig.FIREBASE_CLIENT_EMAIL,
        privateKey: envConfig.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error)
  }
}

export class FirebaseSerivices {
  static async verifyPhoneTokenId(idToken: string, expectedPhoneNumber: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken)

      // 2. Lấy thông tin user từ Firebase
      const userRecord = await admin.auth().getUser(decodedToken.uid)

      // 3. Kiểm tra phone number
      const firebasePhone = userRecord.phoneNumber

      if (!firebasePhone) {
        throw new BadRequestError('Phone number not found in Firebase user')
      }
      // 4. So sánh số điện thoại (normalize format)
      const normalizedExpected = this.normalizePhone(expectedPhoneNumber)
      const normalizedFirebase = this.normalizePhone(firebasePhone)

      if (normalizedExpected !== normalizedFirebase) {
        throw new UnauthorizedError('Phone number mismatch')
      }

      return {
        isValid: true,
        phoneNumber: firebasePhone
      }
    } catch (error) {
      throw new BadRequestError('Invalid phone verification token')
    }
  }

  private static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')

    if (cleaned.startsWith('0')) {
      return '+84' + cleaned.substring(1)
    } else if (cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
      return '+' + cleaned
    } else if (!cleaned.startsWith('+')) {
      return '+84' + cleaned
    }

    return cleaned
  }
}
