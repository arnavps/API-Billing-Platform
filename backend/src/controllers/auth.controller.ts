import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';

const setTokenCookies = (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, company } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User already exists' } });
      return;
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      company,
      verificationToken: hashedVerificationToken,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'MeterFlow - Verify Email',
      message: `Please verify your email at: ${verifyUrl}`,
    });

    const accessToken = generateAccessToken(user._id as unknown as string, user.role);
    const refreshToken = generateRefreshToken(user._id as unknown as string);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    setTokenCookies(res, refreshToken);

    res.status(201).json({
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during registration' } });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account is disabled' } });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id as unknown as string, user.role);
    const refreshToken = generateRefreshToken(user._id as unknown as string);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    setTokenCookies(res, refreshToken);

    res.json({
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during login' } });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;
    
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }

    res.clearCookie('refreshToken');
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during logout' } });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } });
      return;
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc || tokenDoc.isRevoked || tokenDoc.expiresAt < new Date()) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
      return;
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
      return;
    }

    // Revoke old refresh token for rotation
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const newAccessToken = generateAccessToken(user._id as unknown as string, user.role);
    const newRefreshToken = generateRefreshToken(user._id as unknown as string);

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    setTokenCookies(res, newRefreshToken);

    res.json({
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during token refresh' } });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't leak whether user exists
      res.json({ data: { message: 'If email exists, a reset link was sent.' } });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'MeterFlow - Password Reset',
      message: `You requested a password reset. Go to this link: ${resetUrl}`,
    });

    res.json({ data: { message: 'If email exists, a reset link was sent.' } });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during forgot password' } });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedResetToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ data: { message: 'Password reset successfully' } });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during password reset' } });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const hashedVerificationToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedVerificationToken,
    });

    if (!user) {
      res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid verification token' } });
      return;
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ data: { message: 'Email verified successfully' } });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Server error during email verification' } });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized' } });
    return;
  }
  
  res.json({
    data: {
      _id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      avatar: req.user.avatar,
      emailVerified: req.user.emailVerified,
      subscription: req.user.subscription,
      settings: req.user.settings,
    }
  });
};
