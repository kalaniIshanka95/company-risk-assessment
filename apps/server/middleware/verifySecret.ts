import { Request, Response, NextFunction } from 'express';

// Shared secret auth — checks that the client sends the correct x-auth-secret header.
// The secret is set via the AUTH_SECRET environment variable.
export const verifySecret = (req: Request, res: Response, next: NextFunction): void => {
  const secret = req.headers['x-auth-secret'];
  if (!secret || secret !== process.env.AUTH_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
