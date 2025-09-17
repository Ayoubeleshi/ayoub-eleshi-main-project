import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { emailOAuthService } from '@/services/emailOAuth';

const EmailOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const provider = searchParams.get('provider') || 'gmail';

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        let tokenData;
        if (provider === 'gmail') {
          tokenData = await emailOAuthService.exchangeGmailCode(code);
        } else if (provider === 'outlook') {
          tokenData = await emailOAuthService.exchangeOutlookCode(code);
        } else {
          throw new Error('Unsupported provider');
        }

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: `${provider.toUpperCase()}_OAUTH_SUCCESS`,
            tokenData
          }, window.location.origin);
        }

        // Close the popup
        window.close();
      } catch (error) {
        console.error('OAuth callback error:', error);
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: `${provider.toUpperCase()}_OAUTH_ERROR`,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, window.location.origin);
        }

        // Close the popup
        window.close();
      }
    };

    handleOAuthCallback();
  }, [searchParams, provider]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">
          Connecting your {provider === 'gmail' ? 'Gmail' : 'Outlook'} account...
        </p>
      </div>
    </div>
  );
};

export default EmailOAuthCallback;
