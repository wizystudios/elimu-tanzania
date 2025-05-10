
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent } from '@/components/ui/card';
import { SchoolType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

// List of Tanzanian regions
const tanzanianRegions = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi',
  'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro',
  'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani',
  'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Tabora', 'Tanga',
  'Zanzibar Central/South', 'Zanzibar North', 'Zanzibar Urban/West'
];

// Districts by region
const districtsByRegion = {
  'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Ubungo', 'Kigamboni'],
  'Arusha': ['Arusha DC', 'Arusha MC', 'Karatu', 'Longido', 'Meru', 'Monduli', 'Ngorongoro'],
  'Dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma MC', 'Kondoa', 'Kongwa', 'Mpwapwa'],
  'Kilimanjaro': ['Hai', 'Moshi DC', 'Moshi MC', 'Mwanga', 'Rombo', 'Same', 'Siha'],
  'Mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Nyamagana', 'Sengerema', 'Ukerewe'],
  // Add more regions and districts as needed
  // Default for other regions
  'default': ['Wilaya 1', 'Wilaya 2', 'Wilaya 3', 'Wilaya Nyingine']
};

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
  country: z.string().default("Tanzania"),
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
  
  // Admin Account
  adminFirstName: z.string().min(2, {
    message: "Jina la kwanza la msimamizi linahitajika."
  }),
  adminLastName: z.string().min(2, {
    message: "Jina la mwisho la msimamizi linahitajika."
  }),
  adminEmail: z.string().email({
    message: "Tafadhali ingiza anwani halali ya barua pepe ya msimamizi."
  }),
  adminPassword: z.string().min(8, {
    message: "Nenosiri lazima liwe na angalau herufi 8."
  }),
  adminConfirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.adminConfirmPassword, {
  message: "Nenosiri hazifanani",
  path: ["adminConfirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SchoolRegistrationForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'basic' | 'location' | 'additional' | 'admin'>('basic');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      email: "",
      phone: "",
      type: "primary",
      country: "Tanzania",
      region: "",
      district: "",
      ward: "",
      street: "",
      establishedDate: "",
      description: "",
      headmasterName: "",
      headmasterPhone: "",
      headmasterEmail: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: ""
    },
  });

  const watchRegion = form.watch('region');
  
  // Update available districts when region changes
  useEffect(() => {
    if (watchRegion) {
      setAvailableDistricts(districtsByRegion[watchRegion as keyof typeof districtsByRegion] || districtsByRegion.default);
      // Reset district if region changes
      form.setValue('district', '');
    }
  }, [watchRegion, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setRegistrationError(null);
    
    try {
      console.log("Starting school registration process...");
      // Create subdomain from school name
      const subdomain = data.name.toLowerCase().replace(/\s+/g, '');
      
      // 1. First, create the school record with public access
      console.log("Attempting to insert school record as public...");
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: data.name,
          registration_number: data.registrationNumber,
          email: data.email,
          phone: data.phone,
          type: data.type,
          subdomain: subdomain,
          established_date: data.establishedDate || null,
          description: data.description || null
        })
        .select();
      
      if (schoolError) {
        console.error("School creation error:", schoolError);
        throw new Error(`School creation failed: ${schoolError.message}`);
      }
      
      if (!schoolData || schoolData.length === 0) {
        console.error("No school data returned after insert");
        throw new Error("School creation failed: No data returned");
      }
      
      const schoolId = schoolData[0].id;
      console.log("School created successfully with ID:", schoolId);
      
      // 2. Create location for the school
      console.log("Adding school location...");
      const { error: locationError } = await supabase
        .from('school_locations')
        .insert({
          school_id: schoolId,
          region: data.region,
          district: data.district,
          ward: data.ward,
          street: data.street
        });
      
      if (locationError) {
        console.error("Location creation error:", locationError);
        throw new Error(`Location creation failed: ${locationError.message}`);
      }
      
      console.log("School location added successfully");
      
      // 3. Add headmaster information
      console.log("Adding headmaster information...");
      const { error: adminError } = await supabase
        .from('school_administrators')
        .insert({
          school_id: schoolId,
          name: data.headmasterName,
          email: data.headmasterEmail,
          phone: data.headmasterPhone
        });
      
      if (adminError) {
        console.error("Administrator creation error:", adminError);
        throw new Error(`Administrator creation failed: ${adminError.message}`);
      }
      
      console.log("School administrator added successfully");
      
      // 4. Create admin user account
      console.log("Creating admin user account...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.adminEmail,
        password: data.adminPassword,
        options: {
          data: {
            first_name: data.adminFirstName,
            last_name: data.adminLastName,
          },
        }
      });
      
      if (authError) {
        console.error("User creation error:", authError);
        throw new Error(`User creation failed: ${authError.message}`);
      }
      
      if (!authData.user) {
        console.error("No user data returned after signup");
        throw new Error("User creation failed: No user data returned");
      }
      
      console.log("User created successfully with ID:", authData.user.id);
      
      // 5. Assign admin role to the new user
      console.log("Assigning admin role...");
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          school_id: schoolId,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("Role assignment error:", roleError);
        throw new Error(`Role assignment failed: ${roleError.message}`);
      }
      
      console.log("Admin role assigned successfully");
      
      // Success!
      toast.success("Usajili wa shule umefanikiwa!", {
        description: `${data.name} imesajiliwa. Tovuti ya shule yako itakuwa inapatikana hivi karibuni kwenye ${subdomain}.elimutanzania.co.tz`,
      });
      
      // Redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationError(error.message);
      toast.error("Hitilafu kwenye usajili: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const schoolTypes: {value: SchoolType; label: string; swahiliLabel: string}[] = [
    { value: 'kindergarten', label: 'Kindergarten', swahiliLabel: 'Chekechea' },
    { value: 'primary', label: 'Primary School', swahiliLabel: 'Shule ya Msingi' },
    { value: 'secondary', label: 'Secondary School', swahiliLabel: 'Sekondari O-Level' },
    { value: 'advanced', label: 'Advanced Level', swahiliLabel: 'Sekondari A-Level' },
  ];
  
  const goToNextStep = () => {
    if (currentStep === 'basic') {
      const basicFields = ['name', 'registrationNumber', 'email', 'phone', 'type'];
      const valid = basicFields.every(field => 
        !form.getFieldState(field as any).invalid && form.getValues(field as any)
      );
      
      if (valid) {
        setCurrentStep('location');
        return;
      }
      // Trigger validation for fields
      basicFields.forEach(field => form.trigger(field as any));
    } 
    else if (currentStep === 'location') {
      const locationFields = ['region', 'district', 'ward', 'street'];
      const valid = locationFields.every(field => 
        !form.getFieldState(field as any).invalid && form.getValues(field as any)
      );
      
      if (valid) {
        setCurrentStep('additional');
        return;
      }
      locationFields.forEach(field => form.trigger(field as any));
    }
    else if (currentStep === 'additional') {
      const additionalFields = ['headmasterName', 'headmasterPhone', 'headmasterEmail'];
      const valid = additionalFields.every(field => 
        !form.getFieldState(field as any).invalid && form.getValues(field as any)
      );
      
      if (valid) {
        setCurrentStep('admin');
        return;
      }
      additionalFields.forEach(field => form.trigger(field as any));
    }
  };

  return (
    <>
      {registrationError && (
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Hitilafu kwenye usajili</AlertTitle>
          <AlertDescription>
            {registrationError}
            <p className="mt-2">
              Ikiwa tatizo linaendelea, tafadhali wasiliana na msimamizi.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg dark:bg-gray-800 border dark:border-gray-700">
        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="basic">Msingi</TabsTrigger>
            <TabsTrigger value="location">Mahali</TabsTrigger>
            <TabsTrigger value="additional">Ziada</TabsTrigger>
            <TabsTrigger value="admin">Msimamizi</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <TabsContent value="basic" className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Taarifa za Msingi za Shule</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jina la Shule</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingiza jina la shule" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                        <Input placeholder="Namba ya usajili wa shule" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                          <Input type="email" placeholder="school@example.com" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                          <Input placeholder="+255 xxx xxx xxx" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
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
                
                <div className="pt-4">
                  <Button type="button" onClick={goToNextStep}>Endelea</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Taarifa za Mahali pa Shule</h3>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nchi</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectValue placeholder="Chagua nchi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Kwa sasa mfumo unapatikana Tanzania tu.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mkoa</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                              <SelectValue placeholder="Chagua mkoa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tanzanianRegions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!watchRegion}
                        >
                          <FormControl>
                            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                              <SelectValue placeholder="Chagua wilaya" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDistricts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
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
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata</FormLabel>
                        <FormControl>
                          <Input placeholder="mfano., Msasani" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                          <Input placeholder="mfano., Barabara ya Mbezi Beach" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="button" onClick={goToNextStep}>Endelea</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="additional" className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Taarifa za Ziada</h3>
                
                <FormField
                  control={form.control}
                  name="establishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarehe ya Kuanzishwa</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                        <Textarea placeholder="Toa maelezo mafupi kuhusu shule yako..." {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                      </FormControl>
                      <FormDescription>
                        Historia fupi, dhamira, na maono ya shule yako.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4 border-t pt-4 mt-4 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Taarifa za Mkuu wa Shule</h4>
                  
                  <FormField
                    control={form.control}
                    name="headmasterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jina la Mkuu wa Shule</FormLabel>
                        <FormControl>
                          <Input placeholder="Jina kamili la mkuu wa shule" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                            <Input placeholder="+255 xxx xxx xxx" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
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
                            <Input type="email" placeholder="headmaster@example.com" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="button" onClick={goToNextStep}>Endelea</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Taarifa za Msimamizi wa Mfumo</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Tengeneza akaunti ya msimamizi (admin) ya kutumia kuingia kwenye mfumo.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adminFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jina la Kwanza</FormLabel>
                        <FormControl>
                          <Input placeholder="Jina la kwanza" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jina la Mwisho</FormLabel>
                        <FormControl>
                          <Input placeholder="Jina la mwisho" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barua Pepe</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@example.com" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nenosiri</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="adminConfirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thibitisha Nenosiri</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="dark:bg-gray-700 dark:border-gray-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 border-t dark:border-gray-700">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Inasajili...
                      </>
                    ) : (
                      "Sajili Shule"
                    )}
                  </Button>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                    Kwa kusajili, unakubali Masharti yetu ya Huduma na Sera ya Faragha.
                  </p>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </Card>
    </>
  );
};

export default SchoolRegistrationForm;
