
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const examFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Exam title must be at least 2 characters.',
  }),
  subject: z.string().min(1, {
    message: 'Subject is required.',
  }),
  educationLevel: z.string().min(1, {
    message: 'Education level is required.',
  }),
  date: z.date({
    required_error: 'Exam date is required.',
  }),
  startTime: z.string().min(1, {
    message: 'Start time is required.',
  }),
  duration: z.string().min(1, {
    message: 'Duration is required.',
  }),
  description: z.string().optional(),
  passingScore: z.string().min(1, {
    message: 'Passing score is required.',
  }),
  totalMarks: z.string().min(1, {
    message: 'Total marks is required.',
  }),
});

export const CreateExamForm: React.FC = () => {
  const form = useForm<z.infer<typeof examFormSchema>>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      educationLevel: '',
      date: undefined,
      startTime: '',
      duration: '',
      description: '',
      passingScore: '',
      totalMarks: '',
    },
  });

  const onSubmit = (data: z.infer<typeof examFormSchema>) => {
    // In a real app, this would create a new exam via API
    console.log('Form data submitted:', data);
    toast({
      title: 'Exam Created',
      description: `${data.title} has been scheduled for ${format(data.date, 'MMMM d, yyyy')}`,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Title</FormLabel>
              <FormControl>
                <Input placeholder="End Term Mathematics Exam" {...field} />
              </FormControl>
              <FormDescription>
                Enter a descriptive name for the examination.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Kiswahili">Kiswahili</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="educationLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="chekechea">Kindergarten</SelectItem>
                    <SelectItem value="darasa1">Primary 1</SelectItem>
                    <SelectItem value="darasa2">Primary 2</SelectItem>
                    <SelectItem value="darasa3">Primary 3</SelectItem>
                    <SelectItem value="darasa4">Primary 4</SelectItem>
                    <SelectItem value="darasa5">Primary 5</SelectItem>
                    <SelectItem value="darasa6">Primary 6</SelectItem>
                    <SelectItem value="darasa7">Primary 7</SelectItem>
                    <SelectItem value="form1">Form 1</SelectItem>
                    <SelectItem value="form2">Form 2</SelectItem>
                    <SelectItem value="form3">Form 3</SelectItem>
                    <SelectItem value="form4">Form 4</SelectItem>
                    <SelectItem value="form5">Form 5</SelectItem>
                    <SelectItem value="form6">Form 6</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Exam Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Marks</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passingScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passing Score</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about the exam..."
                  className="h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Create Exam</Button>
        </div>
      </form>
    </Form>
  );
};
