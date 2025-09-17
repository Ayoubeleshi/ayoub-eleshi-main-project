import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  FileText, 
  Trash2, 
  Star, 
  Archive,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  AtSign
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useEmailAccounts, useEmailFolders, EmailAccount, EmailFolder } from '@/hooks/useEmail';

export type EmailView = 'inbox' | 'compose' | 'accounts' | 'settings';

interface EmailSidebarProps {
  currentView: EmailView;
  onViewChange: (view: EmailView) => void;
  onCompose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedAccountId?: string;
  onAccountSelect?: (accountId: string) => void;
  selectedFolderId?: string;
  onFolderSelect?: (folderId: string) => void;
}

const EmailSidebar: React.FC<EmailSidebarProps> = ({
  currentView,
  onViewChange,
  onCompose,
  collapsed,
  onToggleCollapse,
  selectedAccountId,
  onAccountSelect,
  selectedFolderId,
  onFolderSelect,
}) => {
  // Fetch real data from hooks
  const { data: accounts = [], isLoading: accountsLoading } = useEmailAccounts();
  const { data: folders = [], isLoading: foldersLoading } = useEmailFolders(selectedAccountId);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return <AtSign className="w-4 h-4 text-red-500" />;
      case 'outlook':
        return <Mail className="w-4 h-4 text-blue-500" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getTotalUnreadCount = () => {
    return folders.reduce((sum, folder) => sum + folder.unread_count, 0);
  };

  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'inbox':
        return Mail;
      case 'sent':
        return Send;
      case 'drafts':
        return FileText;
      case 'trash':
        return Trash2;
      case 'archive':
        return Archive;
      case 'spam':
        return Trash2;
      default:
        return Mail;
    }
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Email
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        {!collapsed && (
          <Button
            onClick={onCompose}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        )}
      </div>

      {/* Email Accounts */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Accounts
          </h3>
          <div className="space-y-1">
            {accountsLoading ? (
              <div className="text-center py-2 text-sm text-slate-500">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-2 text-sm text-slate-500">No accounts connected</div>
            ) : (
              accounts.map((account) => (
                <motion.div
                  key={account.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-8 px-2 text-sm",
                      selectedAccountId === account.id && "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    )}
                    onClick={() => onAccountSelect?.(account.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getProviderIcon(account.provider)}
                      <span className="truncate">{account.email}</span>
                    </div>
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Folders */}
      <div className="flex-1 p-4">
        {!collapsed && (
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Folders
          </h3>
        )}
        <div className="space-y-1">
          {foldersLoading ? (
            <div className="text-center py-2 text-sm text-slate-500">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="text-center py-2 text-sm text-slate-500">No folders found</div>
          ) : (
            folders.map((folder) => {
              const Icon = getFolderIcon(folder.type);
              return (
                <motion.div
                  key={folder.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-8 px-2 text-sm",
                      selectedFolderId === folder.id && "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    )}
                    onClick={() => onFolderSelect?.(folder.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate">{folder.name}</span>
                          {folder.unread_count > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {folder.unread_count}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{getTotalUnreadCount()} unread</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange('accounts')}
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSidebar;
