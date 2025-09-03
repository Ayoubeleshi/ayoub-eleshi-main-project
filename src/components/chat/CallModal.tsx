import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId?: string;
  channelName?: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  callType?: 'voice' | 'video';
}

const CallModal: React.FC<CallModalProps> = ({
  open,
  onOpenChange,
  channelId,
  channelName,
  recipientId,
  recipientName,
  recipientAvatar,
  callType = 'voice',
}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [callStatus, setCallStatus] = useState<'initiating' | 'ringing' | 'connected' | 'ended'>('initiating');
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);

  // Start call mutation
  const startCallMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          channel_id: channelId,
          direct_message_user_id: recipientId,
          call_type: callType,
          started_by: profile.id,
          organization_id: profile.organization_id,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCallStatus('ringing');
      toast.success('Call initiated');
      
      // Simulate call connection after 3 seconds (in real app, this would be WebRTC)
      setTimeout(() => {
        setCallStatus('connected');
        startTimer();
      }, 3000);
    },
    onError: (error) => {
      toast.error('Failed to start call: ' + error.message);
      onOpenChange(false);
    },
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from('call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', callId);

      if (error) throw error;
    },
    onSuccess: () => {
      setCallStatus('ended');
      toast.success('Call ended');
      setTimeout(() => {
        onOpenChange(false);
        resetCallState();
      }, 2000);
    },
  });

  const startTimer = () => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  };

  const resetCallState = () => {
    setCallStatus('initiating');
    setCallDuration(0);
    setParticipants([]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // In a real implementation, you'd get the actual call ID
    endCallMutation.mutate('dummy-call-id');
  };

  useEffect(() => {
    if (open && callStatus === 'initiating') {
      startCallMutation.mutate();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (callStatus === 'connected') {
        // Clean up any ongoing call when component unmounts
        resetCallState();
      }
    };
  }, []);

  const getCallTitle = () => {
    if (channelId && channelName) {
      return `#${channelName}`;
    }
    if (recipientName) {
      return recipientName;
    }
    return 'Call';
  };

  const getCallSubtitle = () => {
    switch (callStatus) {
      case 'initiating':
        return 'Starting call...';
      case 'ringing':
        return channelId ? 'Calling channel members...' : 'Ringing...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Avatar or Channel Icon */}
          <div className="relative">
            {channelId ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="w-12 h-12 text-white" />
              </div>
            ) : (
              <Avatar className="w-24 h-24">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  {recipientName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}

            {/* Status indicator */}
            <div className="absolute -top-2 -right-2">
              <Badge 
                variant={callStatus === 'connected' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {callStatus === 'connected' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />}
                {callStatus}
              </Badge>
            </div>
          </div>

          {/* Call Info */}
          <div className="text-center">
            <h3 className="text-xl font-semibold">{getCallTitle()}</h3>
            <p className="text-muted-foreground flex items-center justify-center mt-1">
              {callStatus === 'connected' && <Clock className="w-4 h-4 mr-1" />}
              {getCallSubtitle()}
            </p>
          </div>

          {/* Participants (for channel calls) */}
          {channelId && participants.length > 0 && (
            <div className="flex -space-x-2">
              {participants.slice(0, 4).map((participant, index) => (
                <Avatar key={index} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {participant.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{participants.length - 4}</span>
                </div>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center space-x-4">
            {/* Audio Toggle */}
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              disabled={callStatus !== 'connected'}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            {/* Video Toggle (if video call) */}
            {callType === 'video' && (
              <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                size="lg"
                className="rounded-full w-12 h-12 p-0"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                disabled={callStatus !== 'connected'}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            )}

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={handleEndCall}
              disabled={endCallMutation.isPending || callStatus === 'ended'}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          {/* Call Status Messages */}
          {callStatus === 'ringing' && (
            <p className="text-sm text-muted-foreground text-center">
              {channelId 
                ? 'Channel members will receive a notification to join the call.'
                : 'Waiting for answer...'
              }
            </p>
          )}

          {callStatus === 'ended' && (
            <p className="text-sm text-muted-foreground text-center">
              Call duration: {formatDuration(callDuration)}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;