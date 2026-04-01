const { z } = require('zod');
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

const loginSchema = z
  .object({
    identifier: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    username: z.string().trim().min(1).optional(),
    password: z.string().min(1)
  })
  .refine((value) => Boolean(value.identifier || value.email || value.username), {
    message: 'Cần nhập identifier, username hoặc email',
    path: ['identifier']
  });

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const identifier = payload.identifier || payload.email || payload.username;

    const result = await authService.login({
      identifier,
      password: payload.password
    });

    return sendSuccess(res, result, 'Đăng nhập thành công');
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  getMe
};
