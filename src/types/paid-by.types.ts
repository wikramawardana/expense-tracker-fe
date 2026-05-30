export interface PaidBy {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaidByResponse {
  status: string;
  message: string;
  data: PaidBy[];
}

export interface SinglePaidByResponse {
  status: string;
  message: string;
  data: PaidBy;
}

export interface CreatePaidByPayload {
  name: string;
}

export interface UpdatePaidByPayload {
  name?: string;
  is_active?: boolean;
}
