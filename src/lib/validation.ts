import { z } from 'zod';

export const orderSchema = z.object({
  customer_name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  customer_phone: z.string().trim().regex(/^\+?[0-9 \-]{7,20}$/, 'Invalid phone number'),
  customer_address: z.string().trim().min(5, 'Address too short').max(500, 'Address too long'),
});

export const reasonSchema = z.string().trim().min(1, 'Reason is required').max(500, 'Reason too long');

export const adminMessageSchema = z.string().trim().min(1, 'Message is required').max(1000, 'Message too long');
