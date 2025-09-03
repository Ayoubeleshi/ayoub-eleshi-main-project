// Define chat-related types that extend Supabase types
export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  organization_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  organization_id?: string;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  content: string;
  message_type?: 'text' | 'file' | 'image' | 'link';
  file_url?: string;
  sender_id: string;
  channel_id?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export interface DirectMessage {
  id: string;
  content: string;
  message_type?: 'text' | 'file' | 'image' | 'link';
  file_url?: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  recipient?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}