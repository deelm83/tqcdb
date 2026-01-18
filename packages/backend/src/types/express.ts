// Extend Express Request interface to include admin property
declare global {
  namespace Express {
    interface Request {
      admin?: {
        role: string;
        iat: number;
      };
    }
  }
}

export {};
