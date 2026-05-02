import { Request, Response } from 'express';
import { API } from '../models/API';
import { AppError } from '../middleware/error';

export class MarketplaceController {
  /**
   * GET /api/marketplace
   * Public list of APIs with filtering and search
   */
  static async listAPIs(req: Request, res: Response) {
    const { search, category, tag, sort, page = 1, limit = 12 } = req.query;

    const query: any = { visibility: 'public', status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (tag) query.tags = tag;

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') sortOption = { 'analytics.totalRequests': -1 };
    if (sort === 'rating') sortOption = { 'marketplace.rating': -1 };

    const apis = await API.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName avatar company');

    const total = await API.countDocuments(query);

    res.json({
      success: true,
      data: apis,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  /**
   * GET /api/marketplace/featured
   */
  static async getFeatured(req: Request, res: Response) {
    const apis = await API.find({
      visibility: 'public',
      status: 'active',
      'marketplace.isFeatured': true,
    })
      .limit(6)
      .populate('userId', 'firstName lastName avatar company');

    res.json({ success: true, data: apis });
  }

  /**
   * GET /api/marketplace/:slug
   */
  static async getAPIDetails(req: Request, res: Response) {
    const { slug } = req.params;
    const api = await API.findOne({ slug, visibility: 'public' })
      .populate('userId', 'firstName lastName avatar company');

    if (!api) throw new AppError('API not found', 404);

    res.json({ success: true, data: api });
  }

  /**
   * GET /api/search
   * Global search across user's private APIs and public marketplace
   */
  static async globalSearch(req: Request, res: Response) {
    const { q } = req.query;
    const userId = (req as any).user?.id;

    if (!q) throw new AppError('Search query is required', 400);

    const searchQuery = {
      $and: [
        {
          $or: [
            { userId }, // User's own APIs
            { visibility: 'public' }, // Public APIs
          ],
        },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    };

    const results = await API.find(searchQuery)
      .limit(10)
      .select('name description slug icon visibility category');

    res.json({ success: true, data: results });
  }
}
