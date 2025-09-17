import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types
export interface EmailAccount {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook';
  email: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string[];
  is_active: boolean;
  last_sync_at?: string;
  sync_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailFolder {
  id: string;
  account_id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
  external_id?: string;
  parent_id?: string;
  unread_count: number;
  total_count: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  folder_id: string;
  external_id?: string;
  thread_id?: string;
  subject?: string;
  sender_email: string;
  sender_name?: string;
  recipient_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  reply_to?: string;
  body_html?: string;
  body_text?: string;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  is_draft: boolean;
  is_sent: boolean;
  has_attachments: boolean;
  received_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAttachment {
  id: string;
  email_id: string;
  filename: string;
  mime_type?: string;
  size?: number;
  storage_path?: string;
  external_id?: string;
  content_id?: string;
  is_inline: boolean;
  download_url?: string;
  created_at: string;
}

// Hook for fetching email accounts
export const useEmailAccounts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['email-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailAccount[];
    },
    enabled: !!user,
  });
};

// Hook for fetching email folders
export const useEmailFolders = (accountId?: string) => {
  return useQuery({
    queryKey: ['email-folders', accountId],
    queryFn: async () => {
      if (!accountId) return [];
      
      const { data, error } = await supabase
        .from('email_folders')
        .select('*')
        .eq('account_id', accountId)
        .order('type', { ascending: true });
      
      if (error) throw error;
      return data as EmailFolder[];
    },
    enabled: !!accountId,
  });
};

// Hook for fetching emails
export const useEmails = (folderId?: string, limit = 50) => {
  return useQuery({
    queryKey: ['emails', folderId, limit],
    queryFn: async () => {
      if (!folderId) return [];
      
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_folders!inner(name, type),
          email_attachments(*)
        `)
        .eq('folder_id', folderId)
        .order('received_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as (Email & { email_folders: EmailFolder; email_attachments: EmailAttachment[] })[];
    },
    enabled: !!folderId,
  });
};

// Hook for fetching a single email
export const useEmail = (emailId?: string) => {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: async () => {
      if (!emailId) return null;
      
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_folders!inner(name, type),
          email_attachments(*)
        `)
        .eq('id', emailId)
        .single();
      
      if (error) throw error;
      return data as Email & { email_folders: EmailFolder; email_attachments: EmailAttachment[] };
    },
    enabled: !!emailId,
  });
};

// Hook for email actions (mark as read, star, etc.)
export const useEmailActions = () => {
  const queryClient = useQueryClient();
  
  const markAsRead = useMutation({
    mutationFn: async ({ emailId, isRead }: { emailId: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: isRead })
        .eq('id', emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
  
  const toggleStar = useMutation({
    mutationFn: async ({ emailId, isStarred }: { emailId: string; isStarred: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: isStarred })
        .eq('id', emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
  
  const toggleImportant = useMutation({
    mutationFn: async ({ emailId, isImportant }: { emailId: string; isImportant: boolean }) => {
      const { error } = await supabase
        .from('emails')
        .update({ is_important: isImportant })
        .eq('id', emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
  
  const deleteEmail = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
  
  return {
    markAsRead,
    toggleStar,
    toggleImportant,
    deleteEmail,
  };
};

// Hook for sending emails
export const useSendEmail = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (emailData: {
      accountId: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      bodyHtml: string;
      bodyText: string;
      attachments?: File[];
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First, get the sent folder for this account
      const { data: sentFolder } = await supabase
        .from('email_folders')
        .select('id')
        .eq('account_id', emailData.accountId)
        .eq('type', 'sent')
        .single();
      
      if (!sentFolder) throw new Error('Sent folder not found');
      
      // Create the email record
      const { data: email, error: emailError } = await supabase
        .from('emails')
        .insert({
          account_id: emailData.accountId,
          folder_id: sentFolder.id,
          subject: emailData.subject,
          sender_email: user.email || '',
          sender_name: user.user_metadata?.full_name || '',
          recipient_emails: emailData.to,
          cc_emails: emailData.cc || [],
          bcc_emails: emailData.bcc || [],
          body_html: emailData.bodyHtml,
          body_text: emailData.bodyText,
          is_sent: true,
          sent_at: new Date().toISOString(),
          has_attachments: (emailData.attachments?.length || 0) > 0,
        })
        .select()
        .single();
      
      if (emailError) throw emailError;
      
      // Handle attachments if any
      if (emailData.attachments && emailData.attachments.length > 0) {
        const attachmentPromises = emailData.attachments.map(async (file) => {
          // Upload file to storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `email-attachments/${email.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('email-attachments')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('email-attachments')
            .getPublicUrl(filePath);
          
          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('email_attachments')
            .insert({
              email_id: email.id,
              filename: file.name,
              mime_type: file.type,
              size: file.size,
              storage_path: filePath,
              download_url: urlData.publicUrl,
            });
          
          if (attachmentError) throw attachmentError;
        });
        
        await Promise.all(attachmentPromises);
      }
      
      return email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-folders'] });
    },
  });
};

// Hook for email search
export const useEmailSearch = (query: string, accountId?: string) => {
  return useQuery({
    queryKey: ['email-search', query, accountId],
    queryFn: async () => {
      if (!query || !accountId) return [];
      
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          email_folders!inner(name, type),
          email_attachments(*)
        `)
        .eq('account_id', accountId)
        .or(`subject.ilike.%${query}%,sender_email.ilike.%${query}%,body_text.ilike.%${query}%`)
        .order('received_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as (Email & { email_folders: EmailFolder; email_attachments: EmailAttachment[] })[];
    },
    enabled: !!query && !!accountId,
  });
};

// Hook for email account management
export const useEmailAccountActions = () => {
  const queryClient = useQueryClient();
  
  const addAccount = useMutation({
    mutationFn: async (accountData: {
      provider: 'gmail' | 'outlook';
      email: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: string;
      scope?: string[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: user.user.id,
          provider: accountData.provider,
          email: accountData.email,
          access_token: accountData.accessToken,
          refresh_token: accountData.refreshToken,
          expires_at: accountData.expiresAt,
          scope: accountData.scope,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
  
  const updateAccount = useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: string; updates: Partial<EmailAccount> }) => {
      const { error } = await supabase
        .from('email_accounts')
        .update(updates)
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
  
  const deleteAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
  
  return {
    addAccount,
    updateAccount,
    deleteAccount,
  };
};
