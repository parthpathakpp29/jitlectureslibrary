import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Subject } from "@/lib/types";

// Form validation schema
const subjectSchema = z.object({
  name: z.string().min(3, "Subject name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  branchId: z.coerce.number().int(),
  semesterId: z.coerce.number().int(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectManagementProps {
  branchId: number;
  semesterId: number;
  onSubjectAdded?: () => void;
}

export function SubjectManagement({ branchId, semesterId, onSubjectAdded }: SubjectManagementProps) {
  const { isProfessor } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // If not a professor, don't render the component
  if (!isProfessor) return null;

  // Form for adding subjects
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      description: "",
      branchId: branchId,
      semesterId: semesterId,
    },
  });

  // Add subject mutation
  const addSubjectMutation = useMutation({
    mutationFn: async (data: SubjectFormValues) => {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      
      return await apiRequest<Subject>({
        url: `/api/subjects?userId=${userId}`,
        method: "POST",
        data: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      // Close dialog and reset form
      setIsDialogOpen(false);
      form.reset();
      // Refresh subjects list
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      if (onSubjectAdded) onSubjectAdded();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: SubjectFormValues) => {
    addSubjectMutation.mutate(values);
  };

  return (
    <div className="mt-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="mb-6 flex items-center"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Subject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new subject to this semester
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Data Structures and Algorithms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the subject"
                        className="resize-none min-h-[100px]" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Hidden fields */}
              <input type="hidden" {...form.register("branchId")} value={branchId} />
              <input type="hidden" {...form.register("semesterId")} value={semesterId} />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={addSubjectMutation.isPending}
                >
                  {addSubjectMutation.isPending ? "Adding..." : "Add Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}