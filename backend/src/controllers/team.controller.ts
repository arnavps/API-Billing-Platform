import { Request, Response } from 'express';
import { Team } from '../models/Team';
import User from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { NotificationService } from '../services/notification.service';
import crypto from 'crypto';
import { AppError } from '../middleware/error';

export class TeamController {
  static async createTeam(req: Request, res: Response) {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const team = await Team.create({
      name,
      ownerId: userId,
      members: [
        {
          userId,
          role: 'owner',
          permissions: {
            manageAPIs: true,
            manageKeys: true,
            viewAnalytics: true,
            manageBilling: true,
            manageTeam: true,
          },
          joinedAt: new Date(),
        },
      ],
    });

    await ActivityLog.create({
      userId,
      teamId: team._id,
      action: 'team.created',
      entityType: 'team',
      entityId: team._id,
      metadata: { name },
    });

    res.status(201).json({ status: 'success', data: team });
  }

  static async inviteMember(req: Request, res: Response) {
    const { teamId } = req.params;
    const { email, role } = req.body;
    const userId = req.user?._id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const team = await Team.findById(teamId);
    if (!team) throw new AppError('Team not found', 404);

    // Check permissions (only owner or admin can invite)
    const requester = team.members.find(m => m.userId.toString() === userId.toString());
    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      throw new AppError('Permission denied', 403);
    }

    // Check if already a member
    const existingUser = await User.findOne({ email });
    if (existingUser && team.members.some(m => m.userId.toString() === existingUser._id.toString())) {
      throw new AppError('User is already a member of this team', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = {
      email,
      role: role || 'member',
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    };

    team.invitations.push(invitation);
    await team.save();

    // Log activity
    await ActivityLog.create({
      userId,
      teamId: team._id,
      action: 'team.invitation_sent',
      entityType: 'team',
      entityId: team._id,
      metadata: { email, role },
    });

    // In a real app, send email here. For now, notify via internal system if user exists
    if (existingUser) {
      await NotificationService.create(existingUser._id, {
        type: 'team.invitation',
        title: 'Team Invitation',
        message: `You have been invited to join team ${team.name}`,
        metadata: { teamId: team._id, token },
      });
    }

    res.status(200).json({ status: 'success', message: 'Invitation sent' });
  }

  static async joinTeam(req: Request, res: Response) {
    const { token } = req.body;
    const userId = req.user?._id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const team = await Team.findOne({ 'invitations.token': token });
    if (!team) throw new AppError('Invalid or expired invitation', 400);

    const invitation = team.invitations.find(inv => inv.token === token);
    if (!invitation || invitation.expiresAt < new Date()) {
      throw new AppError('Invitation expired', 400);
    }

    // Check if user email matches invitation email
    const user = await User.findById(userId);
    if (user?.email !== invitation.email) {
      throw new AppError('Email mismatch', 403);
    }

    // Add to members
    team.members.push({
      userId: user._id,
      role: invitation.role as any,
      permissions: {
        manageAPIs: invitation.role === 'admin',
        manageKeys: invitation.role === 'admin',
        viewAnalytics: true,
        manageBilling: invitation.role === 'admin',
        manageTeam: false,
      },
      joinedAt: new Date(),
      invitedAt: invitation.createdAt,
    });

    // Remove invitation
    team.invitations = team.invitations.filter(inv => inv.token !== token);
    await team.save();

    await ActivityLog.create({
      userId,
      teamId: team._id,
      action: 'team.member_joined',
      entityType: 'team',
      entityId: team._id,
    });

    res.status(200).json({ status: 'success', data: team });
  }

  static async getTeamDetails(req: Request, res: Response) {
    const { teamId } = req.params;
    const userId = req.user?._id;

    const team = await Team.findById(teamId).populate('members.userId', 'firstName lastName email avatar');
    if (!team) throw new AppError('Team not found', 404);

    // Check if user is a member
    if (!team.members.some(m => m.userId._id.toString() === userId?.toString())) {
      throw new AppError('Access denied', 403);
    }

    res.status(200).json({ status: 'success', data: team });
  }

  static async removeMember(req: Request, res: Response) {
    const { teamId, targetUserId } = req.params;
    const userId = req.user?._id;

    const team = await Team.findById(teamId);
    if (!team) throw new AppError('Team not found', 404);

    const requester = team.members.find(m => m.userId.toString() === userId?.toString());
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      throw new AppError('Permission denied', 403);
    }

    // Don't allow removing the owner
    const target = team.members.find(m => m.userId.toString() === targetUserId);
    if (target?.role === 'owner') {
      throw new AppError('Cannot remove the team owner', 400);
    }

    team.members = team.members.filter(m => m.userId.toString() !== targetUserId);
    await team.save();

    await ActivityLog.create({
      userId,
      teamId: team._id,
      action: 'team.member_removed',
      entityType: 'team',
      entityId: team._id,
      metadata: { removedUserId: targetUserId },
    });

    res.status(200).json({ status: 'success', message: 'Member removed' });
  }
}
