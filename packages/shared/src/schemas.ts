import { z } from "zod";
import type { OrderStatus } from "./status";

export const Money = z.number().finite().nonnegative();

export const MenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: Money,
  imageUrl: z.string().url(),
  isAvailable: z.boolean().default(true)
});

export const CartLineSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(50)
});

export const CustomerSchema = z.object({
  name: z.string().min(2).max(80),
  address: z.string().min(5).max(200),
  phone: z.string().min(7).max(30)
});

export const CreateOrderRequestSchema = z.object({
  customer: CustomerSchema,
  lines: z.array(CartLineSchema).min(1)
});

export const UpdateDeliveryRequestSchema = z.object({
  customer: CustomerSchema
});

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type CartLine = z.infer<typeof CartLineSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type UpdateDeliveryRequest = z.infer<typeof UpdateDeliveryRequestSchema>;

export type OrderLineSnapshot = {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
};

export type Order = {
  id: string;
  customer: Customer;
  lines: OrderLineSnapshot[];
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; at: string }>;
  createdAt: string;
};
