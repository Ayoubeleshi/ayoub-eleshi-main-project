import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Plus, Settings, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import EmailSidebar from './EmailSidebar';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import EmailAccountManager from './EmailAccountManager';

export type EmailView = 'inbox' | 'compose' | 'accounts' | 'settings';

interface EmailLayoutProps {
  className?: string;
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ className = '' }) => {
  const [currentView, setCurrentView] = useState<EmailView>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmail(emailId);
    setCurrentView('inbox');
  };

  const handleCompose = () => {
    setCurrentView('compose');
    setSelectedEmail(null);
  };

  const handleBackToInbox = () => {
    setCurrentView('inbox');
    setSelectedEmail(null);
  };

  return (
    <div className={`flex h-full bg-slate-50 dark:bg-slate-900 ${className}`}>
      {/* Email Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0`}>
        <EmailSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCompose={handleCompose}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedAccountId={selectedAccountId}
          onAccountSelect={setSelectedAccountId}
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
        />
      </div>

      {/* Main Email Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Email Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Side - Search */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCompose}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compose
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('accounts')}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 min-h-0 flex">
          <AnimatePresence mode="wait">
            {currentView === 'inbox' && (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 flex"
              >
                {/* Email List */}
                <div className="w-1/2 border-r border-slate-200 dark:border-slate-700">
                  <EmailList
                    folderId={selectedFolderId}
                    onEmailSelect={handleEmailSelect}
                    selectedEmailId={selectedEmail}
                    searchQuery={searchQuery}
                  />
                </div>
                
                {/* Email Viewer */}
                <div className="w-1/2">
                  {selectedEmail ? (
                    <EmailViewer
                      emailId={selectedEmail}
                      onBack={handleBackToInbox}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-800">
                      <div className="text-center">
                        <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Select an email
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                          Choose an email from the list to read it
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentView === 'compose' && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1"
              >
                <EmailComposer
                  onBack={handleBackToInbox}
                  onSend={() => setCurrentView('inbox')}
                />
              </motion.div>
            )}

            {currentView === 'accounts' && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1"
              >
                <EmailAccountManager
                  onBack={handleBackToInbox}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmailLayout;