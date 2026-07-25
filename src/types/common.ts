/**
 * Common TypeScript interfaces used across the application
 * Provides type safety for data structures that were previously using 'any'
 */

export interface DatabaseRecord {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleEvent extends DatabaseRecord {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  location?: string;
  description?: string;
  color?: string;
}

export interface TeamMember extends DatabaseRecord {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  location?: string;
  skills?: string[];
  currentProject?: string;
  image?: string;
  avatar?: string;
  accentColor?: string;
  statusColor?: string;
  completedProjects?: number;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface GearItem extends DatabaseRecord {
  name: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'damaged';
  serialNumber?: string;
  purchaseDate?: string;
  lastMaintenance?: string;
  assignedTo?: string;
  location?: string;
  notes?: string;
}

export interface FinanceItem extends DatabaseRecord {
  amount: number;
  date: string;
  description?: string;
  category?: string;
  isDeleted?: boolean;
}

export interface ChatMessage extends DatabaseRecord {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export type JsonObject = Record<string, unknown>;
export type JsonArray = unknown[];
