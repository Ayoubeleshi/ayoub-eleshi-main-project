import React from 'react';
import ChatLayout from '../chat/ChatLayout';

const ChatSection: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col">
      <ChatLayout />
    </div>
  );
};

export default ChatSection;