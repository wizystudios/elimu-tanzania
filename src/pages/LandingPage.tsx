
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
  LayoutGrid,
  BookUser,
  BadgeCheck,
  Award
} from 'lucide-react';
import { SchoolType } from '@/types';
import HeroSection from '@/components/landing/HeroSection';
import FeatureCard from '@/components/landing/FeatureCard';
import SchoolRegistrationForm from '@/components/landing/SchoolRegistrationForm';

const LandingPage = () => {
  const schoolTypes: { type: SchoolType; label: string; swahiliLabel: string; description: string }[] = [
    {
      type: 'kindergarten',
      label: 'Kindergarten',
      swahiliLabel: 'Chekechea',
      description: 'Early childhood education for the youngest learners'
    },
    {
      type: 'primary',
      label: 'Primary School',
      swahiliLabel: 'Shule ya Msingi',
      description: 'Foundation education for children aged 7-14'
    },
    {
      type: 'secondary',
      label: 'Secondary School',
      swahiliLabel: 'Sekondari O-Level',
      description: 'Secondary education for Form I-IV students'
    },
    {
      type: 'advanced',
      label: 'Advanced Level',
      swahiliLabel: 'Sekondari A-Level',
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
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Huduma Kuu za Mfumo</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu wa usimamizi wa shule umetengenezwa maalum kwa ajili ya taasisi za elimu za Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<School className="h-8 w-8 text-tanzanian-blue" />} 
              title="Usajili wa Shule"
              description="Sajili shule yako na pata subdomain maalum kwa ajili ya wasimamizi, walimu, wanafunzi, na wazazi wako."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-tanzanian-blue" />} 
              title="Dashbodi ya Msimamizi"
              description="Wasimamizi wa shule wanaweza kudhibiti watumiaji, madarasa, walimu, kalenda ya shule, na shughuli zote za shule."
            />
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8 text-tanzanian-blue" />} 
              title="Majukumu ya Mwalimu"
              description="Dashbodi mbalimbali kwa majukumu ya walimu ikiwa ni pamoja na walimu wa kawaida, wakuu wa shule, walimu wa taaluma, na zaidi."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-tanzanian-blue" />} 
              title="Usimamizi wa Wanafunzi"
              description="Sajili wanafunzi, fuatilia mahudhurio, simamia kazi za nyumbani, na kushughulikia uhamisho kati ya shule."
            />
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-tanzanian-blue" />} 
              title="Ufikiaji wa Wazazi"
              description="Wazazi wanaweza kufuatilia utendaji wa watoto wao, mahudhurio, na matangazo ya shule."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-tanzanian-blue" />} 
              title="Ratiba na Mipango"
              description="Simamia ratiba za darasa, ratiba za mitihani, na kalenda za taaluma kwa ufanisi."
            />
            <FeatureCard 
              icon={<BookUser className="h-8 w-8 text-tanzanian-blue" />} 
              title="Majukumu ya Walimu"
              description="Usimamizi wa walimu wa kawaida, wakuu wa shule, walimu wa taaluma, nidhamu, michezo, na mazingira."
            />
            <FeatureCard 
              icon={<BadgeCheck className="h-8 w-8 text-tanzanian-blue" />} 
              title="Usimamizi wa Madarasa"
              description="Unda na simamia madarasa kulingana na ngazi ya shule, ratiba za masomo, na shughuli za kila siku."
            />
            <FeatureCard 
              icon={<Award className="h-8 w-8 text-tanzanian-blue" />} 
              title="Mitihani na Tathmini"
              description="Panga mitihani, chapisha matokeo, na uchambuzi wa utendaji wa wanafunzi katika masomo yote."
            />
          </div>
        </div>
      </section>

      {/* School Types Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Aina za Shule Tunazoshughulikia</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu unasaidia muundo kamili wa elimu ya Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolTypes.map((schoolType) => (
              <Card key={schoolType.type} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-tanzanian-blue">{schoolType.label}</CardTitle>
                  <CardDescription className="font-semibold">{schoolType.swahiliLabel}</CardDescription>
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
            <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue">Sajili Shule Yako</h2>
            <p className="text-gray-600 text-center mb-12">
              Jiunge na mamia ya shule nchini Tanzania ambazo tayari zinatumia jukwaa letu.
              Jaza fomu hapa chini ili kuanza.
            </p>
            
            <SchoolRegistrationForm />

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Je, tayari umesajili shule yako?</p>
              <Link to="/login">
                <Button variant="outline">Ingia kwenye portal ya shule yako</Button>
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
                Mfumo bora wa usimamizi wa shule uliotengenezwa maalum kwa ajili ya shule za Tanzania za ngazi zote.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Wasiliana Nasi</h3>
              <p>Barua pepe: support@elimutanzania.com</p>
              <p>Simu: +255 755 123 456</p>
              <p>Anwani: Dar es Salaam, Tanzania</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Viungo</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Kuhusu Sisi</a></li>
                <li><a href="#" className="hover:underline">Huduma</a></li>
                <li><a href="#" className="hover:underline">Sajili</a></li>
                <li><Link to="/login" className="hover:underline">Ingia</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Elimu Tanzania. Haki zote zimehifadhiwa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
