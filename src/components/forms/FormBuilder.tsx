import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FormInput, Trash2, Eye, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Form {
  id: string;
  title: string;
  description: string;
  fields: any;
  created_at: string;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options?: string[];
}

interface FormSubmission {
  id: string;
  form_id: string;
  data: any;
  submitted_by_email?: string;
  created_at: string;
}

const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
];

export default function FormBuilder() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  // Form builder state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Field builder state
  const [fieldType, setFieldType] = useState<FormField['type']>('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');

  useEffect(() => {
    if (profile?.organization_id) {
      fetchForms();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedForm) {
      fetchSubmissions(selectedForm.id);
    }
  }, [selectedForm]);

  const fetchForms = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (formId: string) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id || formFields.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('forms')
        .insert({
          organization_id: profile.organization_id,
          title: formTitle,
          description: formDescription,
          fields: JSON.stringify(formFields),
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form created successfully",
      });

      setFormTitle('');
      setFormDescription('');
      setFormFields([]);
      setIsFormDialogOpen(false);
      fetchForms();
      setSelectedForm(data);
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(2, 15),
      type: fieldType,
      label: fieldLabel,
      required: fieldRequired,
      options: fieldType === 'select' || fieldType === 'radio' 
        ? fieldOptions.split('\n').filter(opt => opt.trim()) 
        : undefined
    };

    setFormFields([...formFields, newField]);
    setFieldLabel('');
    setFieldOptions('');
    setFieldRequired(false);
    setIsFieldDialogOpen(false);
  };

  const removeField = (fieldId: string) => {
    setFormFields(formFields.filter(field => field.id !== fieldId));
  };

  const copyFormUrl = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Form URL copied to clipboard",
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading forms...</div>;
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                    id="formTitle"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Form Fields</h3>
                  <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Form Field</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fieldType">Field Type</Label>
                          <Select value={fieldType} onValueChange={(value: FormField['type']) => setFieldType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fieldLabel">Field Label</Label>
                          <Input
                            id="fieldLabel"
                            value={fieldLabel}
                            onChange={(e) => setFieldLabel(e.target.value)}
                            required
                          />
                        </div>
                        {(fieldType === 'select' || fieldType === 'radio') && (
                          <div>
                            <Label htmlFor="fieldOptions">Options (one per line)</Label>
                            <Textarea
                              id="fieldOptions"
                              value={fieldOptions}
                              onChange={(e) => setFieldOptions(e.target.value)}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={4}
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="fieldRequired"
                            checked={fieldRequired}
                            onChange={(e) => setFieldRequired(e.target.checked)}
                          />
                          <Label htmlFor="fieldRequired">Required field</Label>
                        </div>
                        <Button type="button" onClick={addField} className="w-full">
                          Add Field
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
                          {field.required && <Badge variant="secondary">Required</Badge>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {formFields.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No fields added yet
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={formFields.length === 0}>
                Create Form
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FormInput className="mr-2 h-5 w-5" />
              Forms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forms.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No forms created yet
                </p>
              ) : (
                forms.map((form) => (
                  <div key={form.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between" onClick={() => setSelectedForm(form)}>
                      <div>
                        <h3 className="font-medium">{form.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {form.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {form.fields.length} fields
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(form.created_at), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyFormUrl(form.id);
                        }}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/form/${form.id}`, '_blank');
                        }}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Details & Submissions */}
        {selectedForm ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Form Details */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedForm.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{selectedForm.description}</p>
                <div className="flex items-center space-x-4">
                  <Badge>{selectedForm.fields.length} fields</Badge>
                  <Badge variant="secondary">{submissions.length} submissions</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            {submission.submitted_by_email || 'Anonymous'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {Object.entries(submission.data).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center">
              <FormInput className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Form Selected</h3>
              <p className="text-muted-foreground">
                Select a form to view details and submissions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}