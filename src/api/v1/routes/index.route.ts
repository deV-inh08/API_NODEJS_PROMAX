import authRouter from '~/api/v1/routes/auth.route'
import { Router } from 'express'

const routerApiV1 = Router()

// Router cho 'Auth'
routerApiV1.use('/auth', authRouter)

// Router cho 'Product'

export default routerApiV1
