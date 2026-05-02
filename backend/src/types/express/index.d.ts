import { IUser } from '../../models/User';
import { IAPI } from '../../models/API';
import { IAPIKey } from '../../models/APIKey';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      apiKey?: string;
      api?: IAPI;
      apiKeyDoc?: IAPIKey;
      requestId?: string;
      startTime?: number;
      targetUrl?: string;
      proxyResponse?: {
        status: number;
        data: any;
        headers: any;
      };
    }
  }
}
