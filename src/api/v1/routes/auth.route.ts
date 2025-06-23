import { Router } from "express";
const authRouter = Router()

// ==================== PUBLIC ROUTES ====================
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.get('/register', (req, res) => {
  res.send('<h1>Hello Register page</h1>')
})

export default authRouter
