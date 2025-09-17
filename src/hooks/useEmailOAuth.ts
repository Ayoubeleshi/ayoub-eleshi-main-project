import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailOAuthService } from '@/services/emailOAuth';
import { useEmailAccountActions } from './useEmail';
import { useAuth } from './useAuth';

export const useEmailOAuth = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addAccount } = useEmailAccountActions();

  const connectGmail = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Generate OAuth URL
      const authUrl = emailOAuthService.generateGmailAuthUrl();
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to close or receive the code
      return new Promise<{ access_token: string; refresh_token: string; expires_in: number; scope: string }>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            reject(new Error('OAuth popup was closed'));
          }
        }, 1000);

        // Listen for message from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            resolve(event.data.tokenData);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageHandler);
      });
    },
    onSuccess: async (tokenData) => {
      if (!user) return;
      
      try {
        // Get user profile
        const profile = await emailOAuthService.getGmailProfile(tokenData.access_token);
        
        // Calculate expiration time
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
        
        // Add account to database
        await addAccount.mutateAsync({
          provider: 'gmail',
          email: profile.email,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          scope: tokenData.scope.split(' ')
        });
        
        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      } catch (error) {
        console.error('Failed to save Gmail account:', error);
        throw error;
      }
    },
  });

  const connectOutlook = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      // Generate OAuth URL
      const authUrl = emailOAuthService.generateOutlookAuthUrl();
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'outlook-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to close or receive the code
      return new Promise<{ access_token: string; refresh_token: string; expires_in: number; scope: string }>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            reject(new Error('OAuth popup was closed'));
          }
        }, 1000);

        // Listen for message from popup
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'OUTLOOK_OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            resolve(event.data.tokenData);
          } else if (event.data.type === 'OUTLOOK_OAUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            popup?.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageHandler);
      });
    },
    onSuccess: async (tokenData) => {
      if (!user) return;
      
      try {
        // Get user profile
        const profile = await emailOAuthService.getOutlookProfile(tokenData.access_token);
        
        // Calculate expiration time
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
        
        // Add account to database
        await addAccount.mutateAsync({
          provider: 'outlook',
          email: profile.email,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          scope: tokenData.scope.split(' ')
        });
        
        // Invalidate queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      } catch (error) {
        console.error('Failed to save Outlook account:', error);
        throw error;
      }
    },
  });

  return {
    connectGmail,
    connectOutlook,
  };
};
