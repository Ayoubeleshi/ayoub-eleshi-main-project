import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BoardList } from '@/components/boards/BoardList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TasksSection() {
  console.log('🚀 TasksSection: Component is rendering!');
  
  const { profile, user, isLoading: authLoading } = useAuth();

  console.log('🔍 TasksSection: Auth state:', { 
    profile: !!profile, 
    user: !!user, 
    authLoading,
    organization_id: profile?.organization_id 
  });

  // Show loading state while auth is loading
  if (authLoading) {
    console.log('🔍 TasksSection: Showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground mt-1">Organize and track your team's work with our intuitive boards</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-2"></div>
            <div className="h-5 bg-muted/60 rounded w-64 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if user has organization
  if (!profile?.organization_id) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground mt-1">Organize and track your team's work with our intuitive boards</p>
          </div>
        </div>
        
        <Card className="p-8 bg-gradient-card backdrop-blur-sm border-0 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Organization Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You need to be part of an organization to use task management. Please contact your administrator or complete your profile setup.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>User ID: {user?.id}</p>
              <p>Profile ID: {profile?.id}</p>
              <p>Organization ID: {profile?.organization_id || 'None'}</p>
            </div>
            
            {/* Debug: Show current auth state */}
            <div className="mt-4 p-4 bg-muted/20 rounded-lg text-left">
              <h4 className="font-medium mb-2">Debug Information:</h4>
              <pre className="text-xs text-muted-foreground overflow-auto">
                {JSON.stringify({ user, profile }, null, 2)}
              </pre>
            </div>

            {/* Temporary: Manual organization creation for testing */}
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const { supabase } = await import('@/integrations/supabase/client');
                    const orgName = 'Test Organization';
                    const { data: orgData, error: orgError } = await supabase
                      .from('organizations')
                      .insert({
                        name: orgName,
                        slug: `${orgName.toLowerCase().replace(/\s+/g, '-')}-${user?.id?.substring(0, 8)}`
                      })
                      .select()
                      .single();

                    if (orgError) {
                      console.error('Error creating organization:', orgError);
                      alert('Error creating organization: ' + orgError.message);
                      return;
                    }

                    // Update profile with organization_id
                    const { error: updateError } = await supabase
                      .from('profiles')
                      .update({ organization_id: orgData.id })
                      .eq('user_id', user?.id);

                    if (updateError) {
                      console.error('Error updating profile:', updateError);
                      alert('Error updating profile: ' + updateError.message);
                      return;
                    }

                    alert('Organization created successfully! Please refresh the page.');
                    window.location.reload();
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error: ' + error);
                  }
                }}
              >
                Create Test Organization
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground mt-1">Organize and track your team's work with our intuitive boards</p>
        </div>
      </div>

      {/* Boards List */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <BoardList />
      </div>
    </div>
  );
}