
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  School, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare,
  UserCheck,
  LayoutGrid 
} from 'lucide-react';
import { SchoolType } from '@/types';
import HeroSection from '@/components/landing/HeroSection';
import FeatureCard from '@/components/landing/FeatureCard';
import SchoolRegistrationForm from '@/components/landing/SchoolRegistrationForm';

const LandingPage = () => {
  const schoolTypes: { type: SchoolType; label: string; description: string }[] = [
    {
      type: 'kindergarten',
      label: 'Kindergarten (Chekechea)',
      description: 'Early childhood education for the youngest learners'
    },
    {
      type: 'primary',
      label: 'Primary School (Shule ya Msingi)',
      description: 'Foundation education for children aged 7-14'
    },
    {
      type: 'secondary',
      label: 'Secondary School (O-Level)',
      description: 'Secondary education for Form I-IV students'
    },
    {
      type: 'advanced',
      label: 'Advanced Level (A-Level)',
      description: 'Higher secondary education for Form V-VI students'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Core Features</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our comprehensive school management system is designed specifically for Tanzanian educational institutions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<School className="h-8 w-8 text-tanzanian-blue" />} 
              title="School Registration"
              description="Register your school and get a dedicated subdomain for your administrators, teachers, students, and parents."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-tanzanian-blue" />} 
              title="Admin Dashboard"
              description="School admins can manage users, classes, teachers, school calendar, and all school activities."
            />
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8 text-tanzanian-blue" />} 
              title="Teacher Roles"
              description="Different dashboards for various teacher roles including normal teachers, headmasters, academic teachers, and more."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-tanzanian-blue" />} 
              title="Student Management"
              description="Register students, track attendance, manage assignments, and handle transfers between schools."
            />
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-tanzanian-blue" />} 
              title="Parent Access"
              description="Parents can monitor their children's performance, attendance, and school announcements."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-tanzanian-blue" />} 
              title="Schedules & Planning"
              description="Manage class schedules, exam timetables, and academic calendars efficiently."
            />
          </div>
        </div>
      </section>

      {/* School Types Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Built for All Tanzanian School Types</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our system supports the complete Tanzanian education structure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolTypes.map((schoolType) => (
              <Card key={schoolType.type} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-tanzanian-blue">{schoolType.label}</CardTitle>
                  <CardDescription>{schoolType.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Register Your School</h2>
            <p className="text-gray-600 text-center mb-12">
              Join hundreds of schools across Tanzania that are already using our platform.
              Complete the form below to get started.
            </p>
            
            <SchoolRegistrationForm />

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Already registered your school?</p>
              <Link to="/login">
                <Button variant="outline">Log in to your school portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-tanzanian-blue text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Elimu Tanzania</h3>
              <p className="mb-4">
                The leading school management system designed specifically for Tanzanian schools of all levels.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p>Email: support@elimutanzania.com</p>
              <p>Phone: +255 755 123 456</p>
              <p>Address: Dar es Salaam, Tanzania</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Features</a></li>
                <li><a href="#" className="hover:underline">Register</a></li>
                <li><Link to="/login" className="hover:underline">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Elimu Tanzania. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
