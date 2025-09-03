import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Mail, 
  User,
  Briefcase,
  Target,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    id: 'organization',
    title: 'Create Organization',
    description: 'Set up your workspace and organization details',
    icon: Building
  },
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Tell us about yourself and your role',
    icon: User
  },
  {
    id: 'team',
    title: 'Invite Team',
    description: 'Invite colleagues to join your workspace',
    icon: Users
  },
  {
    id: 'goals',
    title: 'Set Goals',
    description: 'Define your team\'s objectives and preferences',
    icon: Target
  }
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationDescription: '',
    fullName: '',
    role: '',
    department: '',
    teamEmails: '',
    goals: '',
    preferences: []
  });
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    setIsLoading(true);
    
    try {
      // Step 0: Organization setup
      if (currentStep === 0) {
        if (!formData.organizationName.trim()) {
          toast.error('Please enter an organization name');
          return;
        }

        // Check if user already has an organization
        if (profile?.organization_id) {
          toast.info('You already belong to an organization. Skipping organization creation.');
          setCurrentStep(currentStep + 1);
          return;
        }

        // Create organization with better slug generation
        const slug = formData.organizationName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);

        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.organizationName.trim(),
            slug: slug + '-' + Date.now().toString(36)
          })
          .select()
          .single();

        if (orgError) {
          console.error('Organization creation error:', orgError);
          if (orgError.code === '23505') {
            toast.error('An organization with this name already exists. Please choose a different name.');
          } else {
            toast.error('Failed to create organization. Please try again.');
          }
          return;
        }

        // Update user profile with organization
        await updateProfile({
          organization_id: orgData.id,
          full_name: formData.fullName || profile?.full_name
        });

        toast.success('Organization created successfully!');
        
      // Step 1: Profile completion
      } else if (currentStep === 1) {
        if (!formData.fullName.trim()) {
          toast.error('Please enter your full name');
          return;
        }
        if (!formData.role) {
          toast.error('Please select your role');
          return;
        }

        await updateProfile({
          full_name: formData.fullName.trim(),
          role: formData.role as any
        });

        toast.success('Profile updated successfully!');
        
      // Step 2: Team invitations
      } else if (currentStep === 2) {
        if (formData.teamEmails.trim()) {
          const emails = formData.teamEmails
            .split('\n')
            .map(email => email.trim())
            .filter(email => email && email.includes('@'));
          
          if (emails.length > 0) {
            // Here you would typically send invitation emails
            toast.success(`Ready to send invitations to ${emails.length} team members!`);
          } else {
            toast.warning('No valid email addresses found');
          }
        } else {
          toast.info('Skipping team invitations for now. You can invite team members later.');
        }
      }

      // Move to next step or complete onboarding
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        toast.success('🎉 Welcome to WorkFlow! Your workspace is ready.');
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      // Provide specific error messages based on error type
      if (error?.code === 'PGRST301') {
        toast.error('Access denied. Please refresh the page and try again.');
      } else if (error?.code === '42501') {
        toast.error('Permission denied. Please contact support.');
      } else if (error?.message?.includes('infinite recursion')) {
        toast.error('System error detected. Please refresh the page and try again.');
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Something went wrong. Please try again or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    const Icon = step.icon;

    switch (step.id) {
      case 'organization':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  placeholder="Acme Corporation"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="orgDesc">Description (Optional)</Label>
                <Textarea
                  id="orgDesc"
                  placeholder="Tell us about your organization..."
                  value={formData.organizationDescription}
                  onChange={(e) => setFormData({...formData, organizationDescription: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  className="w-full p-2 border rounded-md bg-background"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="">Select your role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Engineering, Marketing, Sales..."
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="emails">Team Email Addresses</Label>
                <Textarea
                  id="emails"
                  placeholder="john@company.com&#10;jane@company.com&#10;mike@company.com"
                  rows={6}
                  value={formData.teamEmails}
                  onChange={(e) => setFormData({...formData, teamEmails: e.target.value})}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Enter one email address per line. We'll send them an invitation to join your workspace.
                </p>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goals">Team Goals & Objectives</Label>
                <Textarea
                  id="goals"
                  placeholder="What are your main goals for using WorkFlow?"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                />
              </div>
              <div>
                <Label>What features are most important to you?</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Team Chat', 'Task Management', 'File Sharing', 'Video Calls', 'Time Tracking', 'Analytics'].map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-gradient-card border-0 shadow-brand">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">WorkFlow Setup</span>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Setup
              </Button>
              <Button
                onClick={handleNext}
                disabled={isLoading || (currentStep === 0 && !formData.organizationName)}
                className="bg-gradient-brand hover:opacity-90"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : currentStep === steps.length - 1 ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}