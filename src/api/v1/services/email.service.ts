import nodemailer from 'nodemailer'
import envConfig from '~/api/v1/config/env.config'
export class EmailServices {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: envConfig.EMAIL_ADMIN,
      pass: envConfig.EMAIL_APP_PASSWORD
    }
  })

  // sendOTP
  static async sendOTPEmail(userEmail: string, otp: string) {
    const mailOptions = {
      from: `Shop Dev <${envConfig.EMAIL_ADMIN}>`,
      to: userEmail,
      subject: 'Password Reset OTP - TechShop',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>Your OTP for password reset is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        
        <hr>
        <small>
          This email was sent from TechShop system. 
          Please do not reply to this email.
        </small>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log('Send Email Success')
      return true
    } catch (error) {
      console.log('Send Email error', error)
      return false
    }
  }

  // ✅ NEW: Shop business verification email
  static async sendShopVerificationEmail(businessEmail: string, otp: string, shopName: string) {
    const mailOptions = {
      from: `TechShop Platform <${envConfig.EMAIL_ADMIN}>`,
      to: businessEmail,
      subject: `🏪 Business Email Verification - ${shopName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏪 Shop Registration</h1>
          </div>
          
          <div style="background: white; padding: 40px; margin: 0;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Business Email Verification</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Hello! You're registering a new shop on our platform:
            </p>
            
            <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin: 0; font-size: 20px;">📋 Shop: ${shopName}</h3>
              <p style="color: #718096; margin: 10px 0 0 0;">Business Email: ${businessEmail}</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px;">
              Your business email verification code is:
            </p>
            
            <div style="background: #f7fafc; border: 2px dashed #a0aec0; padding: 25px; text-align: center; margin: 25px 0;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0;">
              <p style="color: #c53030; margin: 0; font-weight: 600;">⏰ Important:</p>
              <p style="color: #742a2a; margin: 5px 0 0 0;">This code will expire in 10 minutes</p>
            </div>
            
            <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0;">
              <p style="color: #2f855a; margin: 0; font-weight: 600;">🎯 Purpose:</p>
              <p style="color: #276749; margin: 5px 0 0 0;">
                This verifies your business email for receiving customer orders, 
                notifications, and important shop communications.
              </p>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              If you didn't request this shop registration, please ignore this email.
            </p>
          </div>
          
          <div style="background: #edf2f7; padding: 20px; text-align: center;">
            <p style="color: #718096; font-size: 12px; margin: 0;">
              This email was sent from TechShop Platform<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`✅ Shop verification email sent to: ${businessEmail}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send shop verification email:', error)
      return false
    }
  }

  // ✅ NEW: Shop welcome email after successful registration
  static async sendShopWelcomeEmail(businessEmail: string, shop: any) {
    const mailOptions = {
      from: `TechShop Platform <${envConfig.EMAIL_ADMIN}>`,
      to: businessEmail,
      subject: `🎉 Welcome to TechShop - Your shop "${shop.shop_name}" is ready!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Shop Created Successfully!</h1>
          </div>
          
          <div style="background: white; padding: 40px;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Welcome to TechShop, ${shop.owner_info.full_name}!</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Congratulations! Your shop has been successfully created and verified. 
              You can now start selling on our platform.
            </p>
            
            <div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #2f855a; margin: 0 0 15px 0;">📋 Shop Details:</h3>
              <ul style="color: #276749; margin: 0; padding-left: 20px;">
                <li><strong>Shop Name:</strong> ${shop.shop_name}</li>
                <li><strong>Shop URL:</strong> /shop/${shop.shop_slug}</li>
                <li><strong>Verification Level:</strong> ${shop.verification_level}</li>
                <li><strong>Status:</strong> ${shop.status}</li>
              </ul>
            </div>
            
            <div style="background: #e6fffa; border: 1px solid #81e6d9; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #2c7a7b; margin: 0 0 15px 0;">🚀 What you can do now:</h3>
              <ul style="color: #285e61; margin: 0; padding-left: 20px;">
                <li>✅ Create up to ${shop.capabilities.daily_product_limit} products per day</li>
                <li>✅ Receive customer orders</li>
                <li>✅ Manage your shop profile</li>
                <li>✅ Upload shop logo and banner</li>
              </ul>
            </div>
            
            <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #c53030; margin: 0 0 15px 0;">📈 Next Steps (Optional):</h3>
              <ul style="color: #742a2a; margin: 0; padding-left: 20px;">
                <li>📄 Complete business verification for payment processing</li>
                <li>📊 Upload business documents for higher selling limits</li>
                <li>🏦 Add bank account for direct payments</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${'http://localhost:3000'}/seller/dashboard" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                🏪 Go to Seller Dashboard
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              Need help? Contact our support team or check our seller documentation.
            </p>
          </div>
          
          <div style="background: #edf2f7; padding: 20px; text-align: center;">
            <p style="color: #718096; font-size: 12px; margin: 0;">
              Welcome to the TechShop seller community!<br>
              This email was sent from TechShop Platform
            </p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`✅ Welcome email sent to: ${businessEmail}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error)
      return false
    }
  }
}
