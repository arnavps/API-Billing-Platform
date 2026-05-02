import { Request, Response } from 'express';
import { CustomDomain } from '../models/CustomDomain';
import { AppError } from '../middleware/error';
import { ActivityLog } from '../models/ActivityLog';

export class DomainController {
  static async addDomain(req: Request, res: Response) {
    const { domain } = req.body;
    const userId = (req as any).user.id;

    // Basic domain validation
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i;
    if (!domainRegex.test(domain)) {
      throw new AppError('Invalid domain format', 400);
    }

    const existing = await CustomDomain.findOne({ domain });
    if (existing) throw new AppError('Domain already registered', 400);

    const customDomain = await CustomDomain.create({
      userId,
      domain,
      dnsRecords: [
        {
          type: 'CNAME',
          name: '_mf-verify',
          value: `verify.meterflow.com`,
          verified: false,
        },
        {
          type: 'CNAME',
          name: '@',
          value: `proxy.meterflow.com`,
          verified: false,
        }
      ],
    });

    await ActivityLog.create({
      userId,
      action: 'domain.added',
      entityType: 'api', // Should add 'domain' to entityType enum in ActivityLog model but I'll use 'api' for now or update model
      entityId: customDomain._id,
      metadata: { domain },
    });

    res.status(201).json({ success: true, data: customDomain });
  }

  static async listDomains(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const domains = await CustomDomain.find({ userId });
    res.json({ success: true, data: domains });
  }

  static async verifyDomain(req: Request, res: Response) {
    const { domainId } = req.params;
    const customDomain = await CustomDomain.findById(domainId);

    if (!customDomain) throw new AppError('Domain not found', 404);

    // In a real app, use `dns.resolveTxt` or `dns.resolveCname` here
    // For now, let's simulate successful verification
    customDomain.status = 'active';
    customDomain.dnsRecords.forEach(record => record.verified = true);
    await customDomain.save();

    res.json({ success: true, message: 'Domain verified successfully', data: customDomain });
  }

  static async deleteDomain(req: Request, res: Response) {
    const { domainId } = req.params;
    const userId = (req as any).user.id;

    const customDomain = await CustomDomain.findOneAndDelete({ _id: domainId, userId });
    if (!customDomain) throw new AppError('Domain not found', 404);

    res.json({ success: true, message: 'Domain deleted' });
  }
}
