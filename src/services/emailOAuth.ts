// Gmail OAuth Configuration
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID || '586466837959-18qdm12q2fv8bbf99044kdt5d4siq9c8.apps.googleusercontent.com';
const GMAIL_REDIRECT_URI = `${window.location.origin}/email/oauth/gmail/callback`;

// Outlook OAuth Configuration  
const OUTLOOK_CLIENT_ID = import.meta.env.VITE_OUTLOOK_CLIENT_ID || 'your-outlook-client-id';
const OUTLOOK_REDIRECT_URI = `${window.location.origin}/email/oauth/outlook/callback`;

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
  responseType: string;
  accessType?: string;
  prompt?: string;
}

export const GMAIL_OAUTH_CONFIG: OAuthConfig = {
  clientId: GMAIL_CLIENT_ID,
  redirectUri: GMAIL_REDIRECT_URI,
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

export const OUTLOOK_OAUTH_CONFIG: OAuthConfig = {
  clientId: OUTLOOK_CLIENT_ID,
  redirectUri: OUTLOOK_REDIRECT_URI,
  scope: [
    'https://graph.microsoft.com/Mail.Read',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/offline_access'
  ],
  responseType: 'code'
};

export class EmailOAuthService {
  private static instance: EmailOAuthService;
  
  public static getInstance(): EmailOAuthService {
    if (!EmailOAuthService.instance) {
      EmailOAuthService.instance = new EmailOAuthService();
    }
    return EmailOAuthService.instance;
  }

  /**
   * Generate OAuth URL for Gmail
   */
  generateGmailAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GMAIL_OAUTH_CONFIG.clientId,
      redirect_uri: GMAIL_OAUTH_CONFIG.redirectUri,
      scope: GMAIL_OAUTH_CONFIG.scope.join(' '),
      response_type: GMAIL_OAUTH_CONFIG.responseType,
      access_type: GMAIL_OAUTH_CONFIG.accessType || 'online',
      prompt: GMAIL_OAUTH_CONFIG.prompt || 'select_account'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate OAuth URL for Outlook
   */
  generateOutlookAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: OUTLOOK_OAUTH_CONFIG.clientId,
      redirect_uri: OUTLOOK_OAUTH_CONFIG.redirectUri,
      scope: OUTLOOK_OAUTH_CONFIG.scope.join(' '),
      response_type: OUTLOOK_OAUTH_CONFIG.responseType,
      response_mode: 'query'
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token (Gmail)
   */
  async exchangeGmailCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const response = await fetch('/api/oauth/gmail/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: GMAIL_REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Gmail authorization code');
    }

    return response.json();
  }

  /**
   * Exchange authorization code for access token (Outlook)
   */
  async exchangeOutlookCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const response = await fetch('/api/oauth/outlook/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: OUTLOOK_REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Outlook authorization code');
    }

    return response.json();
  }

  /**
   * Refresh access token (Gmail)
   */
  async refreshGmailToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const response = await fetch('/api/oauth/gmail/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Gmail token');
    }

    return response.json();
  }

  /**
   * Refresh access token (Outlook)
   */
  async refreshOutlookToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
  }> {
    const response = await fetch('/api/oauth/outlook/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Outlook token');
    }

    return response.json();
  }

  /**
   * Get user profile from Gmail
   */
  async getGmailProfile(accessToken: string): Promise<{
    email: string;
    name: string;
    picture?: string;
  }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Gmail profile');
    }

    return response.json();
  }

  /**
   * Get user profile from Outlook
   */
  async getOutlookProfile(accessToken: string): Promise<{
    email: string;
    name: string;
    picture?: string;
  }> {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Outlook profile');
    }

    const data = await response.json();
    return {
      email: data.mail || data.userPrincipalName,
      name: data.displayName,
      picture: data.photo?.value
    };
  }
}

export const emailOAuthService = EmailOAuthService.getInstance();
