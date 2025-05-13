
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { supabase } from '@/integrations/supabase/client';

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
});

const Login = () => {
  const [isSchoolFound, setIsSchoolFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: "",
      email: "",
      password: "",
    },
  });
  
  const checkSchool = async () => {
    const schoolName = form.getValues("school");
    if (schoolName.length < 2) {
      toast.error("Tafadhali ingiza jina sahihi la shule");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if school exists in database
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .ilike('name', `%${schoolName}%`)
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("Shule haijapatikana, tafadhali jaribu tena au sajili shule yako");
        } else {
          toast.error("Hitilafu imetokea wakati wa kutafuta shule");
          console.error("Error checking school:", error);
        }
        return;
      }
      
      if (data) {
        setIsSchoolFound(true);
        toast.success(`Shule imepatikana: ${data.name}`);
      }
    } catch (error) {
      console.error("Error checking school:", error);
      toast.error("Hitilafu imetokea wakati wa kutafuta shule");
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        toast.error("Kushindwa kuingia: " + error.message);
        return;
      }
      
      // Check if user has any role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, teacher_role, school_id')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (roleError) {
        console.error("Error checking role:", roleError);
        toast.error("Hitilafu imetokea wakati wa kuthibitisha jukumu lako");
        return;
      }
      
      if (!roleData) {
        toast.error(`Huna jukumu katika mfumo.`);
        // Sign out since no role found
        await supabase.auth.signOut();
        return;
      }
      
      // Successful login
      toast.success("Umeingia kwa mafanikio!", {
        description: `Karibu kwenye akaunti yako ya ${getRoleLabel(roleData.role)}.`,
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Hitilafu imetokea wakati wa kuingia");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Msimamizi';
      case 'teacher': return 'Mwalimu';
      case 'student': return 'Mwanafunzi';
      case 'parent': return 'Mzazi';
      case 'super_admin': return 'Msimamizi Mkuu';
      case 'headmaster': return 'Mwalimu Mkuu';
      case 'vice_headmaster': return 'Makamu Mwalimu Mkuu';
      case 'academic_teacher': return 'Mwalimu wa Taaluma';
      case 'discipline_teacher': return 'Mwalimu wa Nidhamu';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-gray-800 border dark:border-gray-700">
        <CardHeader className="pb-6 text-center">
          <div className="flex justify-between items-center">
            <div></div>
            <CardTitle className="text-2xl font-bold text-tanzanian-blue dark:text-blue-400">
              Elimu Tanzania
            </CardTitle>
            <ThemeToggle />
          </div>
          <CardDescription className="dark:text-gray-400">
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
                        <FormLabel className="dark:text-gray-200">Jina la Shule</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="Ingiza jina la shule yako" 
                              {...field} 
                              className="flex-grow dark:bg-gray-700 dark:border-gray-600"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            onClick={checkSchool}
                            disabled={isLoading}
                          >
                            {isLoading ? "Inatafuta..." : "Tafuta"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Ingiza jina la shule yako ili kuanza.
                  </p>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Barua Pepe</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="barua@mfano.com" 
                            {...field} 
                            className="dark:bg-gray-700 dark:border-gray-600"
                            disabled={isLoading} 
                          />
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
                        <FormLabel className="dark:text-gray-200">Nenosiri</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="dark:bg-gray-700 dark:border-gray-600"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Inaingia..." : "Ingia"}
                  </Button>
                  
                  <div className="text-center text-sm">
                    <button 
                      type="button" 
                      className="text-tanzanian-blue dark:text-blue-400 hover:underline"
                      onClick={() => setIsSchoolFound(false)}
                      disabled={isLoading}
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
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Huna akaunti? Wasiliana na msimamizi wa shule yako au
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/register" className="text-tanzanian-blue dark:text-blue-400 hover:underline">
              Sajili shule mpya
            </Link>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <Link to="/" className="text-tanzanian-blue dark:text-blue-400 hover:underline">
              Rudi kwenye ukurasa wa mwanzo
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
