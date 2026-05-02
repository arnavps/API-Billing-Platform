import { IAPI } from '../models/API';

export class PricingService {
  /**
   * Calculates the cost for an API based on its pricing model and usage.
   * @param api The API model with pricing configuration
   * @param usage Total number of requests in the billing period
   * @returns Total cost in cents
   */
  static calculateUsageCost(api: IAPI, usage: number): number {
    const { pricing } = api;

    if (!pricing || pricing.model === 'free') {
      return 0;
    }

    if (pricing.model === 'pay_per_request') {
      const billableRequests = Math.max(0, usage - (pricing.freeQuota || 0));
      return Math.round(billableRequests * (pricing.pricePerRequest || 0));
    }

    if ((pricing.model === 'hybrid' || pricing.model === 'subscription') && pricing.tiers && pricing.tiers.length > 0) {
      // Graduated pricing (bracket-based)
      let remainingUsage = usage;
      let totalCost = 0;
      let prevLimit = 0;

      // Sort tiers by limit
      const sortedTiers = [...pricing.tiers].sort((a, b) => a.limit - b.limit);

      for (const tier of sortedTiers) {
        const tierCapacity = tier.limit - prevLimit;
        const usageInThisTier = Math.min(remainingUsage, tierCapacity);
        
        if (usageInThisTier <= 0) break;

        totalCost += usageInThisTier * tier.price;
        remainingUsage -= usageInThisTier;
        prevLimit = tier.limit;
      }

      // If usage exceeds the last tier's limit, apply last tier's rate to the excess
      if (remainingUsage > 0 && sortedTiers.length > 0) {
        const lastTier = sortedTiers[sortedTiers.length - 1];
        totalCost += remainingUsage * lastTier.price;
      }

      return Math.round(totalCost);
    }

    return 0;
  }

  /**
   * Generates a billing breakdown for a user across all their used APIs.
   */
  static calculateTotalBill(apisUsage: Array<{ api: IAPI, usage: number }>): {
    lineItems: Array<any>;
    subtotal: number;
  } {
    const lineItems = [];
    let subtotal = 0;

    for (const item of apisUsage) {
      const cost = this.calculateUsageCost(item.api, item.usage);
      if (cost > 0 || (item.api.pricing.model !== 'free' && item.usage > 0)) {
        lineItems.push({
          type: 'usage',
          description: `API Usage: ${item.api.name} (${item.usage.toLocaleString()} requests)`,
          apiId: item.api._id,
          apiName: item.api.name,
          quantity: item.usage,
          unitPrice: cost > 0 ? Math.round(cost / item.usage) : 0,
          amount: cost,
        });
        subtotal += cost;
      }
    }

    return { lineItems, subtotal };
  }

  /**
   * Calculates tax based on country and subtotal.
   */
  static calculateTax(subtotal: number, country: string = 'US'): { rate: number, amount: number } {
    // Basic tax logic
    if (country === 'IN') {
      return { rate: 18, amount: Math.round(subtotal * 0.18) }; // GST
    }
    if (country === 'US') {
      return { rate: 8.5, amount: Math.round(subtotal * 0.085) }; // US Sales Tax
    }
    return { rate: 0, amount: 0 };
  }
}
