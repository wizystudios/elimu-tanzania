
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { SchoolType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  // Basic Information
  name: z.string().min(3, {
    message: "Jina la shule lazima liwe na herufi 3 au zaidi.",
  }),
  registrationNumber: z.string().min(5, {
    message: "Namba ya usajili lazima iwe na herufi 5 au zaidi.",
  }),
  email: z.string().email({
    message: "Tafadhali ingiza anwani halali ya barua pepe.",
  }),
  phone: z.string().min(10, {
    message: "Namba ya simu lazima iwe na tarakimu 10 au zaidi.",
  }),
  type: z.enum(['kindergarten', 'primary', 'secondary', 'advanced'] as const),
  
  // Location Details
  region: z.string().min(2, {
    message: "Mkoa unahitajika.",
  }),
  district: z.string().min(2, {
    message: "Wilaya inahitajika.",
  }),
  ward: z.string().min(2, {
    message: "Kata inahitajika.",
  }),
  street: z.string().min(2, {
    message: "Anwani ya mtaa inahitajika.",
  }),
  
  // Additional Details
  establishedDate: z.string().optional(),
  description: z.string().optional(),
  headmasterName: z.string().min(3, {
    message: "Jina la mkuu wa shule linahitajika."
  }),
  headmasterPhone: z.string().min(10, {
    message: "Namba ya simu ya mkuu wa shule lazima iwe na tarakimu 10 au zaidi."
  }),
  headmasterEmail: z.string().email({
    message: "Tafadhali ingiza anwani halali ya barua pepe ya mkuu wa shule."
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SchoolRegistrationForm: React.FC = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      email: "",
      phone: "",
      type: "primary",
      region: "",
      district: "",
      ward: "",
      street: "",
      establishedDate: "",
      description: "",
      headmasterName: "",
      headmasterPhone: "",
      headmasterEmail: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
    
    // Mock successful registration - in a real app, this would be an API call
    const subdomain = data.name.toLowerCase().replace(/\s+/g, '');
    toast.success("Usajili wa shule umefanikiwa!", {
      description: `${data.name} imesajiliwa. Tovuti ya shule yako itakuwa inapatikana hivi karibuni kwenye ${subdomain}.tunzatech.com`,
    });
    
    form.reset();
  };

  const schoolTypes: {value: SchoolType; label: string; swahiliLabel: string}[] = [
    { value: 'kindergarten', label: 'Kindergarten', swahiliLabel: 'Chekechea' },
    { value: 'primary', label: 'Primary School', swahiliLabel: 'Shule ya Msingi' },
    { value: 'secondary', label: 'Secondary School', swahiliLabel: 'Sekondari O-Level' },
    { value: 'advanced', label: 'Advanced Level', swahiliLabel: 'Sekondari A-Level' },
  ];

  return (
    <Card className="p-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic">Taarifa za Msingi</TabsTrigger>
          <TabsTrigger value="location">Mahali</TabsTrigger>
          <TabsTrigger value="additional">Taarifa za Ziada</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <TabsContent value="basic" className="space-y-4">
              <h3 className="text-xl font-bold">Taarifa za Msingi za Shule</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jina la Shule</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingiza jina la shule" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Namba ya Usajili</FormLabel>
                    <FormControl>
                      <Input placeholder="Namba ya usajili wa shule" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barua pepe</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="school@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Namba ya Simu</FormLabel>
                      <FormControl>
                        <Input placeholder="+255 xxx xxx xxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aina ya Shule</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chagua aina ya shule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schoolTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} ({type.swahiliLabel})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Aina ya shule itaamua moduli na vipengele vitakavyopatikana kwenye mfumo wako.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <h3 className="text-xl font-bold">Taarifa za Mahali pa Shule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mkoa</FormLabel>
                      <FormControl>
                        <Input placeholder="mfano., Dar es Salaam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wilaya</FormLabel>
                      <FormControl>
                        <Input placeholder="mfano., Kinondoni" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata</FormLabel>
                      <FormControl>
                        <Input placeholder="mfano., Msasani" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mtaa</FormLabel>
                      <FormControl>
                        <Input placeholder="mfano., Barabara ya Mbezi Beach" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-4">
              <h3 className="text-xl font-bold">Taarifa za Ziada</h3>
              
              <FormField
                control={form.control}
                name="establishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarehe ya Kuanzishwa</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tarehe ambayo shule ilianzishwa rasmi.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maelezo ya Shule</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Toa maelezo mafupi kuhusu shule yako..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Historia fupi, dhamira, na maono ya shule yako.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4 border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold">Taarifa za Mkuu wa Shule</h4>
                
                <FormField
                  control={form.control}
                  name="headmasterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jina la Mkuu wa Shule</FormLabel>
                      <FormControl>
                        <Input placeholder="Jina kamili la mkuu wa shule" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="headmasterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Namba ya Simu</FormLabel>
                        <FormControl>
                          <Input placeholder="+255 xxx xxx xxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headmasterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barua Pepe</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="headmaster@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
            
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full">
                Sajili Shule
              </Button>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Kwa kusajili, unakubali Masharti yetu ya Huduma na Sera ya Faragha.
              </p>
            </div>
          </form>
        </Form>
      </Tabs>
    </Card>
  );
};

export default SchoolRegistrationForm;
