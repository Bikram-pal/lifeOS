import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { AppError } from '../utils/appError.js';

export class AuthService {
  static async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Create default workspace for user
    await Workspace.create({
      name: `${user.name}'s Workspace`,
      owner: user._id,
      isDefault: true,
    });

    const token = user.generateAuthToken();

    // Exclude password from returned user object
    const userSafe = user.toObject();
    delete userSafe.password;

    return { user: userSafe, token };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    const userSafe = user.toObject();
    delete userSafe.password;

    return { user: userSafe, token };
  }

  static async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
