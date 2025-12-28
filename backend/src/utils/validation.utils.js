import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  deviceId: z.string().uuid('deviceId debe ser un UUID válido').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().uuid('deviceId debe ser un UUID válido').optional(),
});

export const businessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  totalStamps: z.number().int().positive().default(10),
  rewardText: z.string().min(1, 'Reward text is required'),
});

export const redeemCodeSchema = z.object({
  code: z.string().min(6, 'El código debe tener al menos 6 caracteres').max(10, 'El código no puede tener más de 10 caracteres'),
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Error al hacer login',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

