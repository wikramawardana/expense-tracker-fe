// Single recurrence type item
export interface RecurrenceType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API response for recurrence types list
export interface RecurrenceTypesResponse {
  status: string;
  message: string;
  data: RecurrenceType[];
}

// API response for single recurrence type
export interface SingleRecurrenceTypeResponse {
  status: string;
  message: string;
  data: RecurrenceType;
}

// Payload for creating a recurrence type
export interface CreateRecurrenceTypePayload {
  name: string;
  description?: string;
}

// Payload for updating a recurrence type
export interface UpdateRecurrenceTypePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}
