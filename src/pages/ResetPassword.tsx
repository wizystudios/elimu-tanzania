import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Tafadhali jaza nenosiri jipya na uthibitisho wake.');
      return;
    }
    if (password.length < 6) {
      toast.error('Nenosiri lazima liwe na angalau herufi 6.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Nenosiri hayalingani.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error('Imeshindikana kusasisha nenosiri: ' + error.message);
        return;
      }
      toast.success('Nenosiri limebadilishwa kwa mafanikio. Tafadhali ingia tena.');
      await supabase.auth.signOut();
      navigate('/login');
    } catch (e) {
      console.error('Reset password error:', e);
      toast.error('Hitilafu imetokea wakati wa kubadilisha nenosiri.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-gray-800 border dark:border-gray-700">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-2xl font-bold text-tanzanian-blue dark:text-blue-400">Badilisha Nenosiri</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Weka nenosiri jipya kuendelea kutumia akaunti yako
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSession ? (
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              Tafadhali fungua kiungo kilichotumwa kwenye barua pepe yako kisha rudi hapa ili kubadilisha nenosiri.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nenosiri Jipya</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Thibitisha Nenosiri</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <Button className="w-full" onClick={handleUpdatePassword} disabled={isLoading}>
                {isLoading ? 'Inasasisha...' : 'Weka Nenosiri Jipya'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Rudi kwenye kuingia
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
