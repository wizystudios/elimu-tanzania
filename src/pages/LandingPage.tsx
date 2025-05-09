
import React, { useEffect, useRef } from 'react';
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
  ArrowRight,
  ChevronRight,
  Star,
  Shield,
  BookMarked,
  BarChart3,
  Heart
} from 'lucide-react';
import { SchoolType } from '@/types';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FeatureCard from '@/components/landing/FeatureCard';

const LandingPage = () => {
  const textRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    // Text animation on load
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    });
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  const schoolTypes: { type: SchoolType; label: string; swahiliLabel: string; description: string; icon: React.ReactNode }[] = [
    {
      type: 'kindergarten',
      label: 'Kindergarten',
      swahiliLabel: 'Chekechea',
      description: 'Early childhood education for the youngest learners',
      icon: <Star className="h-6 w-6 text-yellow-500" />
    },
    {
      type: 'primary',
      label: 'Primary School',
      swahiliLabel: 'Shule ya Msingi',
      description: 'Foundation education for children aged 7-14',
      icon: <BookOpen className="h-6 w-6 text-green-500" />
    },
    {
      type: 'secondary',
      label: 'Secondary School',
      swahiliLabel: 'Sekondari O-Level',
      description: 'Secondary education for Form I-IV students',
      icon: <BookUser className="h-6 w-6 text-blue-500" />
    },
    {
      type: 'advanced',
      label: 'Advanced Level',
      swahiliLabel: 'Sekondari A-Level',
      description: 'Higher secondary education for Form V-VI students',
      icon: <GraduationCap className="h-6 w-6 text-purple-500" />
    }
  ];

  const benefits = [
    { text: "Kuboresha usimamizi wa shughuli za shule", icon: <Shield className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" /> },
    { text: "Kuongeza ufanisi katika usimamizi wa wanafunzi", icon: <Users className="h-6 w-6 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" /> },
    { text: "Kupunguza muda wa kazi za utawala", icon: <BarChart3 className="h-6 w-6 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" /> },
    { text: "Kuboresha mawasiliano kati ya wadau wote", icon: <MessageSquare className="h-6 w-6 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" /> },
    { text: "Kufuatilia na kupima maendeleo ya wanafunzi kwa urahisi", icon: <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" /> },
    { text: "Kusaidia katika kufanya maamuzi kwa kutumia data", icon: <Award className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-200">Elimu Tanzania</div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900">Ingia</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">Sajili Shule</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-24 px-4 md:px-8 dark:from-blue-900 dark:to-blue-950 overflow-hidden relative">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-purple-500 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-on-scroll" ref={textRef}>
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Elimu Tanzania</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl mt-3 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Mfumo wa Usimamizi wa Shule</span>
            </h1>
            <p className="text-xl mb-8 max-w-lg text-blue-100">
              Jukwaa linalosimamiwa kwa kuzingatia majukumu, lililotengenezwa maalum kwa ajili ya shule za Tanzania 
              za ngazi zote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="bg-white text-blue-800 hover:bg-blue-100 hover:text-blue-900 group">
                  Sajili Shule Yako
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 backdrop-blur-sm">
                Jifunze Zaidi
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <div className="relative w-full aspect-video overflow-hidden rounded-lg shadow-2xl transform hover-scale border border-white/20 bg-white/5 backdrop-blur-sm">
              <video autoPlay muted loop className="w-full h-full object-cover rounded-lg">
                <source src="https://cdn.pixabay.com/vimeo/328890645/classroom-23933.mp4?width=640&hash=6c8e029a8d7e5489887e4d661935f9ffc7205b99" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-blue-900/60 to-transparent">
                <div className="p-5 text-center backdrop-blur-sm rounded-lg">
                  <Heart className="h-10 w-10 text-white mx-auto mb-3" />
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
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-300 animate-on-scroll">Kwa Nini Utuchague</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu wa kisasa wa usimamizi wa shule umetengenezwa maalum kukidhi mahitaji ya taasisi za elimu Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 animate-on-scroll transform transition-all duration-700 hover:translate-x-1"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {benefit.icon}
                  <p className="text-gray-700 dark:text-gray-200">{benefit.text}</p>
                </div>
              ))}
              
              <Link to="/register">
                <Button className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 group">
                  Sajili Sasa <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg transform hover-scale">
              <img 
                src="https://images.unsplash.com/photo-1503676382389-4809596d5290?q=80&w=1374&auto=format&fit=crop" 
                alt="Wanafunzi wakifurahi" 
                className="w-full h-96 object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-300 animate-on-scroll">Huduma Kuu za Mfumo</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu wa usimamizi wa shule umetengenezwa maalum kwa ajili ya taasisi za elimu za Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<School className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Usajili wa Shule"
              description="Sajili shule yako na pata subdomain maalum kwa ajili ya wasimamizi, walimu, wanafunzi, na wazazi wako."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Dashbodi ya Msimamizi"
              description="Wasimamizi wa shule wanaweza kudhibiti watumiaji, madarasa, walimu, kalenda ya shule, na shughuli zote za shule."
            />
            <FeatureCard 
              icon={<GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Majukumu ya Mwalimu"
              description="Dashbodi mbalimbali kwa majukumu ya walimu ikiwa ni pamoja na walimu wa kawaida, wakuu wa shule, walimu wa taaluma, na zaidi."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Usimamizi wa Wanafunzi"
              description="Sajili wanafunzi, fuatilia mahudhurio, simamia kazi za nyumbani, na kushughulikia uhamisho kati ya shule."
            />
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Ufikiaji wa Wazazi"
              description="Wazazi wanaweza kufuatilia utendaji wa watoto wao, mahudhurio, na matangazo ya shule."
            />
            <FeatureCard 
              icon={<Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />} 
              title="Ratiba na Mipango"
              description="Simamia ratiba za darasa, ratiba za mitihani, na kalenda za taaluma kwa ufanisi."
            />
          </div>
        </div>
      </section>

      {/* School Types Section */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-300 animate-on-scroll">Aina za Shule Tunazoshughulikia</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Mfumo wetu unasaidia muundo kamili wa elimu ya Tanzania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolTypes.map((schoolType, index) => (
              <Card 
                key={schoolType.type} 
                className="hover:shadow-lg transition-shadow dark:bg-gray-700 border-blue-100 dark:border-blue-900 overflow-hidden group animate-on-scroll hover:border-blue-300 dark:hover:border-blue-700" 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardHeader className="pb-2">
                  <div className="mb-2">{schoolType.icon}</div>
                  <CardTitle className="text-blue-700 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {schoolType.label}
                  </CardTitle>
                  <CardDescription className="font-semibold dark:text-gray-300">{schoolType.swahiliLabel}</CardDescription>
                  <CardDescription className="dark:text-gray-300">{schoolType.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-900 to-blue-800 dark:from-blue-900 dark:to-blue-700 text-white relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-white animate-pulse"></div>
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll">Uko Tayari Kuanza?</h2>
          <p className="mb-8 max-w-2xl mx-auto text-blue-100">
            Jiunge na mfumo wetu bora wa usimamizi wa shule na boresha uzoefu wa elimu shuleni kwako.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-white text-blue-800 hover:bg-blue-50 hover:text-blue-900 group">
                Sajili Shule Yako
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
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
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Elimu Tanzania</h3>
              <p className="mb-4 text-gray-300">
                Mfumo bora wa usimamizi wa shule uliotengenezwa maalum kwa ajili ya shule za Tanzania za ngazi zote.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Wasiliana Nasi</h3>
              <p className="text-gray-300">Barua pepe: support@elimutanzania.co.tz</p>
              <p className="text-gray-300">Simu: +255 755 123 456</p>
              <p className="text-gray-300">Anwani: Dar es Salaam, Tanzania</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Viungo</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-blue-300 transition-colors">Kuhusu Sisi</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Huduma</a></li>
                <li><Link to="/register" className="hover:text-blue-300 transition-colors">Sajili</Link></li>
                <li><Link to="/login" className="hover:text-blue-300 transition-colors">Ingia</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Elimu Tanzania. Haki zote zimehifadhiwa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
