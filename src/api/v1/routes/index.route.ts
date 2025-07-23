import authRouter from '~/api/v1/routes/auth.route'
import forgotPasswordRouter from '~/api/v1/routes/forgotPassword.route'
import { Router } from 'express'
import shopRouter from '~/api/v1/routes/shop.route'
import { productRouter } from '~/api/v1/routes/product.route'

const routerApiV1 = Router()

// Router cho 'Auth'
routerApiV1.use('/auth', authRouter)

// Router cho Shop
routerApiV1.use('/shop', shopRouter)

// Route cho ForgotPassword & OTP
routerApiV1.use('/forgot-password', forgotPasswordRouter)

// Router cho 'Product'
routerApiV1.use('/product', productRouter)

export default routerApiV1
