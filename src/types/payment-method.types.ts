// Payment method type
export type PaymentMethodType =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "e_wallet"
  | "bank_transfer";

// Single payment method item
export interface PaymentMethod {
  id: string;
  name: string;
  method_type: PaymentMethodType;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API response for payment methods list
export interface PaymentMethodsResponse {
  status: string;
  message: string;
  data: PaymentMethod[];
}

// API response for single payment method
export interface SinglePaymentMethodResponse {
  status: string;
  message: string;
  data: PaymentMethod;
}

// Payload for creating a payment method
export interface CreatePaymentMethodPayload {
  name: string;
  method_type: PaymentMethodType;
  description?: string;
}

// Payload for updating a payment method
export interface UpdatePaymentMethodPayload {
  name?: string;
  method_type?: PaymentMethodType;
  description?: string;
  is_active?: boolean;
}

// Method type options for UI
export const PAYMENT_METHOD_TYPES: {
  value: PaymentMethodType;
  label: string;
  emoji: string;
}[] = [
  { value: "cash", label: "Cash", emoji: "💵" },
  { value: "credit_card", label: "Credit Card", emoji: "💳" },
  { value: "debit_card", label: "Debit Card", emoji: "💳" },
  { value: "e_wallet", label: "E-Wallet", emoji: "📱" },
  { value: "bank_transfer", label: "Bank Transfer", emoji: "🏦" },
];
