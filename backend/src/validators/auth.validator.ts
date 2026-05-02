import { z, ZodSchema, ZodError, ZodIssue } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Schema definitions
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    company: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

// Generic validation middleware
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues.map((e: ZodIssue) => ({ path: e.path.join('.'), message: e.message })),
          },
        });
        return;
      }
      res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error during validation' } });
      return;
    }
  };
};
