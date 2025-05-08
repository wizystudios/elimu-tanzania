
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserRole } from '@/types';

const formSchema = z.object({
  school: z.string().min(2, {
    message: "Jina la shule linahitajika.",
  }),
  email: z.string().email({
    message: "Tafadhali ingiza anwani halali ya barua pepe.",
  }),
  password: z.string().min(6, {
    message: "Nenosiri lazima liwe na angalau herufi 6.",
  }),
  role: z.enum(['admin', 'teacher', 'student', 'parent'] as const),
});

const Login = () => {
  const [isSchoolFound, setIsSchoolFound] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: "",
      email: "",
      password: "",
      role: "teacher",
    },
  });
  
  const checkSchool = () => {
    const schoolName = form.getValues("school");
    if (schoolName.length < 2) {
      toast.error("Tafadhali ingiza jina sahihi la shule");
      return;
    }
    
    // Mock school check - in a real app, this would be an API call
    setTimeout(() => {
      setIsSchoolFound(true);
      toast.success(`Shule imepatikana: ${schoolName}`);
    }, 1000);
  };
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    
    // Mock login - in a real app, this would be an API call
    toast.success("Umeingia kwa mafanikio!", {
      description: `Karibu kwenye akaunti yako ya ${getRoleLabel(data.role as UserRole)}.`,
    });
  };
  
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Msimamizi';
      case 'teacher': return 'Mwalimu';
      case 'student': return 'Mwanafunzi';
      case 'parent': return 'Mzazi';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-tanzanian-blue">
            Elimu Tanzania
          </CardTitle>
          <CardDescription>
            Ingia kwenye mfumo wa usimamizi wa shule
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isSchoolFound ? (
                <>
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jina la Shule</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Ingiza jina la shule yako" 
                              {...field} 
                              className="flex-grow"
                            />
                          </FormControl>
                          <Button type="button" onClick={checkSchool}>Tafuta</Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ingiza jina la shule yako ili kuanza.
                  </p>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Jukumu Lako</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="admin" />
                              </FormControl>
                              <FormLabel className="font-normal">Msimamizi</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="teacher" />
                              </FormControl>
                              <FormLabel className="font-normal">Mwalimu</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="student" />
                              </FormControl>
                              <FormLabel className="font-normal">Mwanafunzi</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="parent" />
                              </FormControl>
                              <FormLabel className="font-normal">Mzazi</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barua Pepe</FormLabel>
                        <FormControl>
                          <Input placeholder="barua@mfano.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nenosiri</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Ingia</Button>
                  
                  <div className="text-center text-sm">
                    <button 
                      type="button" 
                      className="text-tanzanian-blue hover:underline"
                      onClick={() => setIsSchoolFound(false)}
                    >
                      Badilisha shule
                    </button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-gray-500">
            Huna akaunti? Wasiliana na msimamizi wa shule yako.
          </p>
          <p className="text-sm text-center">
            <Link to="/" className="text-tanzanian-blue hover:underline">
              Rudi kwenye ukurasa wa mwanzo
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
