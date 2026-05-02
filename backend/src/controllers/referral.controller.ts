import { Request, Response } from 'express';
import { Referral } from '../models/Referral';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';
import { EmailService } from '../services/email.service';
import { ActivityLogService } from '../services/activityLog.service';

export const getReferralStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized' } });
      return;
    }

    const referrals = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId).select('referralCode billing.credits');

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const totalEarned = referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.reward.amount, 0);

    res.json({
      data: {
        referralCode: user?.referralCode,
        stats: {
          total: totalReferrals,
          completed: completedReferrals,
          pending: pendingReferrals,
          totalEarned,
          credits: user?.billing.credits || 0
        },
        history: referrals
      }
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch referral stats' } });
  }
};

export const inviteByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const userId = req.user?._id;

    if (!email || !userId) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email is required' } });
      return;
    }

    // Check if already referred
    const existing = await Referral.findOne({ referrerId: userId, refereeEmail: email });
    if (existing) {
      res.status(400).json({ error: { code: 'ALREADY_REFERRED', message: 'You have already invited this user' } });
      return;
    }

    const user = await User.findById(userId);
    
    const referral = await Referral.create({
      referrerId: userId,
      refereeEmail: email,
      code: user?.referralCode,
      status: 'pending',
      reward: {
        type: 'credits',
        amount: 500, // $5.00 in credits
        currency: 'USD'
      }
    });

    // Send invitation email
    if (user && user.referralCode) {
      await EmailService.sendReferralInvite(user as IUser, email, user.referralCode);
    }

    res.status(201).json({ data: referral });

    await ActivityLogService.log(req, 'Sent Referral Invite', 'billing', userId, { refereeEmail: email });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create referral' } });
  }
};

export const completeReferral = async (refereeId: string, referralCode: string): Promise<void> => {
  try {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) return;

    const referral = await Referral.findOne({ 
      referrerId: referrer._id, 
      refereeId: { $exists: false },
      status: 'pending' 
    });

    if (referral) {
      referral.status = 'completed';
      referral.refereeId = new mongoose.Types.ObjectId(refereeId);
      referral.completedAt = new Date();
      await referral.save();

      // Reward the referrer
      referrer.billing.credits += referral.reward.amount;
      await referrer.save();

      // Optionally reward the referee too
      const referee = await User.findById(refereeId);
      if (referee) {
        referee.billing.credits += 200; // $2.00 signup bonus
        await referee.save();
      }
    }
  } catch (error) {
    console.error('Error completing referral:', error);
  }
};
