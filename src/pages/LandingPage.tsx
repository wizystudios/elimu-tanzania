
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  Award,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { SchoolType } from '@/types';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FeatureCard from '@/components/landing/FeatureCard';

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

  const benefits = [
    "Kuboresha usimamizi wa shughuli za shule",
    "Kuongeza ufanisi katika usimamizi wa wanafunzi",
    "Kupunguza muda wa kazi za utawala",
    "Kuboresha mawasiliano kati ya wadau wote",
    "Kufuatilia na kupima maendeleo ya wanafunzi kwa urahisi",
    "Kusaidia katika kufanya maamuzi kwa kutumia data"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-tanzanian-blue dark:text-blue-400">Elimu Tanzania</div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="sm">Ingia</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sajili Shule</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-tanzanian-blue to-tanzanian-blue/90 text-white py-20 px-4 md:px-8 dark:from-blue-900 dark:to-blue-950">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Elimu Tanzania
              <span className="block text-2xl md:text-3xl lg:text-4xl mt-2">Mfumo wa Usimamizi wa Shule</span>
            </h1>
            <p className="text-xl mb-8 max-w-lg">
              Jukwaa linalosimamiwa kwa kuzingatia majukumu, lililotengenezwa maalum kwa ajili ya shule za Tanzania 
              za ngazi zote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="bg-white text-tanzanian-blue hover:bg-gray-100 hover:text-tanzanian-blue/90">
                  Sajili Shule Yako
                </Button>
              </Link>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Jifunze Zaidi
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <video autoPlay muted loop className="w-full h-full object-cover rounded-lg">
                <source src="https://cdn.pixabay.com/vimeo/328890645/classroom-23933.mp4?width=640&hash=6c8e029a8d7e5489887e4d661935f9ffc7205b99" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg">
                  <h3 className="text-2xl font-bold text-white">Ongeza Ubora wa Elimu</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue dark:text-blue-400">Kwa Nini Utuchague</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu wa kisasa wa usimamizi wa shule umetengenezwa maalum kukidhi mahitaji ya taasisi za elimu Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-200">{benefit}</p>
                </div>
              ))}
              
              <Link to="/register">
                <Button className="mt-4 flex items-center gap-2">
                  Sajili Sasa <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1503676382389-4809596d5290?q=80&w=1374&auto=format&fit=crop" 
                alt="Wanafunzi wakifurahi" 
                className="w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue dark:text-blue-400">Huduma Kuu za Mfumo</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu wa usimamizi wa shule umetengenezwa maalum kwa ajili ya taasisi za elimu za Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<School className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Usajili wa Shule"
              description="Sajili shule yako na pata subdomain maalum kwa ajili ya wasimamizi, walimu, wanafunzi, na wazazi wako."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Dashbodi ya Msimamizi"
              description="Wasimamizi wa shule wanaweza kudhibiti watumiaji, madarasa, walimu, kalenda ya shule, na shughuli zote za shule."
            />
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Majukumu ya Mwalimu"
              description="Dashbodi mbalimbali kwa majukumu ya walimu ikiwa ni pamoja na walimu wa kawaida, wakuu wa shule, walimu wa taaluma, na zaidi."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Usimamizi wa Wanafunzi"
              description="Sajili wanafunzi, fuatilia mahudhurio, simamia kazi za nyumbani, na kushughulikia uhamisho kati ya shule."
            />
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Ufikiaji wa Wazazi"
              description="Wazazi wanaweza kufuatilia utendaji wa watoto wao, mahudhurio, na matangazo ya shule."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-tanzanian-blue dark:text-blue-400" />} 
              title="Ratiba na Mipango"
              description="Simamia ratiba za darasa, ratiba za mitihani, na kalenda za taaluma kwa ufanisi."
            />
          </div>
        </div>
      </section>

      {/* School Types Section */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-tanzanian-blue dark:text-blue-400">Aina za Shule Tunazoshughulikia</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu unasaidia muundo kamili wa elimu ya Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolTypes.map((schoolType) => (
              <Card key={schoolType.type} className="hover:shadow-lg transition-shadow dark:bg-gray-700">
                <CardHeader>
                  <CardTitle className="text-tanzanian-blue dark:text-blue-400">{schoolType.label}</CardTitle>
                  <CardDescription className="font-semibold dark:text-gray-300">{schoolType.swahiliLabel}</CardDescription>
                  <CardDescription className="dark:text-gray-300">{schoolType.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-tanzanian-blue dark:bg-blue-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Uko Tayari Kuanza?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Jiunge na mfumo wetu bora wa usimamizi wa shule na boresha uzoefu wa elimu shuleni kwako.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-tanzanian-blue hover:bg-gray-100">
                Sajili Shule Yako
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Ingia kwenye Akaunti
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-12 px-4">
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
              <p>Barua pepe: support@elimutanzania.co.tz</p>
              <p>Simu: +255 755 123 456</p>
              <p>Anwani: Dar es Salaam, Tanzania</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Viungo</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Kuhusu Sisi</a></li>
                <li><a href="#" className="hover:underline">Huduma</a></li>
                <li><Link to="/register" className="hover:underline">Sajili</Link></li>
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
