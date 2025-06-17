
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneAuth = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Check if phone number exists in phone_auth table
      const { data: phoneAuthData, error: phoneError } = await supabase
        .from('phone_auth')
        .select('user_id, profiles!inner(*)')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .single();

      if (phoneError || !phoneAuthData) {
        toast.error('Phone number not found or not registered');
        return;
      }

      // Since we can't actually sign in with phone (Supabase requires email/password),
      // we'll redirect to regular login with a hint about the associated email
      const profile = phoneAuthData.profiles as any;
      toast.info(`Please use email login for: ${profile.email}`);
      onClose();
    } catch (error) {
      console.error('Phone auth error:', error);
      toast.error('Failed to authenticate with phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phone Number Login</DialogTitle>
          <DialogDescription>
            Enter your registered phone number to find your account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+255 XXX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handlePhoneAuth} disabled={isLoading} className="flex-1">
              {isLoading ? 'Searching...' : 'Find Account'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneAuthModal;
