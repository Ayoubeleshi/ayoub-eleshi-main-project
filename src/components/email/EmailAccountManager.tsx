import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  AtSign,
  Mail,
  Check,
  X,
  Settings,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { cn } from '@/lib/utils';
import { useEmailAccounts, useEmailAccountActions } from '@/hooks/useEmail';
import { useEmailOAuth } from '@/hooks/useEmailOAuth';

interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook';
  isActive: boolean;
  isConnected: boolean;
  lastSync?: Date;
  unreadCount: number;
}

interface EmailAccountManagerProps {
  onBack: () => void;
}

const EmailAccountManager: React.FC<EmailAccountManagerProps> = ({ onBack }) => {
  // Fetch real data from hooks
  const { data: accounts = [], isLoading } = useEmailAccounts();
  const { deleteAccount } = useEmailAccountActions();
  const { connectGmail, connectOutlook } = useEmailOAuth();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    provider: 'gmail' as 'gmail' | 'outlook',
    email: '',
    password: ''
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return <AtSign className="w-5 h-5 text-red-500" />;
      case 'outlook':
        return <Mail className="w-5 h-5 text-blue-500" />;
      default:
        return <Mail className="w-5 h-5 text-slate-500" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'Gmail';
      case 'outlook':
        return 'Outlook';
      default:
        return 'Unknown';
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.email.trim()) return;

    try {
      if (newAccount.provider === 'gmail') {
        await connectGmail.mutateAsync();
      } else if (newAccount.provider === 'outlook') {
        await connectOutlook.mutateAsync();
      }
      
      setNewAccount({ provider: 'gmail', email: '', password: '' });
      setShowAddAccount(false);
    } catch (error) {
      console.error('Failed to connect account:', error);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteAccount.mutate(accountId);
  };

  const handleConnectAccount = async (provider: 'gmail' | 'outlook') => {
    try {
      if (provider === 'gmail') {
        await connectGmail.mutateAsync();
      } else if (provider === 'outlook') {
        await connectOutlook.mutateAsync();
      }
    } catch (error) {
      console.error('Failed to connect account:', error);
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diff = now.getTime() - syncDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full bg-white dark:bg-slate-800 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Email Accounts
            </h1>
            
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Email Account</DialogTitle>
                  <DialogDescription>
                    Connect your email account to start managing emails.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Email Provider</Label>
                    <Select
                      value={newAccount.provider}
                      onValueChange={(value: 'gmail' | 'outlook') => 
                        setNewAccount(prev => ({ ...prev, provider: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmail">
                          <div className="flex items-center space-x-2">
                            <AtSign className="w-4 h-4 text-red-500" />
                            <span>Gmail</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="outlook">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>Outlook</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddAccount(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAccount}
                      disabled={!newAccount.email.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Add Account
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-slate-500">Loading accounts...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={cn(
                "transition-all duration-200",
                account.is_active ? "border-purple-200 dark:border-purple-700" : "border-slate-200 dark:border-slate-700"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getProviderIcon(account.provider)}
                      <div>
                        <CardTitle className="text-base">{account.email}</CardTitle>
                        <CardDescription className="text-sm">
                          {getProviderName(account.provider)}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {account.access_token ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span>
                        Last sync: {formatLastSync(account.last_sync_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!account.access_token && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnectAccount(account.provider)}
                          className="h-8 px-3 text-xs"
                          disabled={connectGmail.isPending || connectOutlook.isPending}
                        >
                          Connect
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))}
            
            {accounts.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No email accounts
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Add your first email account to start managing emails.
                </p>
                <Button
                  onClick={() => setShowAddAccount(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailAccountManager;
