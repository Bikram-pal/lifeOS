import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await AuthService.register({ name, email, password });
    setAuthCookie(res, token);
    return sendSuccess(res, 201, 'Account created successfully', { user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login({ email, password });
    setAuthCookie(res, token);
    return sendSuccess(res, 200, 'Logged in successfully', { user, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.user._id);
    return sendSuccess(res, 200, 'Current user retrieved', { user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (err) {
    next(err);
  }
};
