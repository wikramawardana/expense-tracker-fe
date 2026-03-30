// Single bill statement item
export interface BillStatement {
  id: string;
  name: string;
  payment_method_id: string | null;
  statement_date: string | null;
  due_date: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API response for bill statements list
export interface BillStatementsResponse {
  status: string;
  message: string;
  data: BillStatement[];
}

// API response for single bill statement
export interface SingleBillStatementResponse {
  status: string;
  message: string;
  data: BillStatement;
}

// Payload for creating a bill statement
export interface CreateBillStatementPayload {
  name: string;
  payment_method_id?: string;
  statement_date?: string;
  due_date?: string;
  description?: string;
}

// Payload for updating a bill statement
export interface UpdateBillStatementPayload {
  name?: string;
  payment_method_id?: string;
  statement_date?: string;
  due_date?: string;
  description?: string;
  is_active?: boolean;
}
