
export type SchoolType = 'kindergarten' | 'primary' | 'secondary' | 'advanced';

export interface SchoolLocation {
  id: string;
  ward: string;
  region: string;
  street: string;
  district: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  registration_number: string;
  email: string;
  phone: string;
  type: SchoolType;
  subdomain: string;
  logo: string | null;
  established_date: string;
  description: string;
  created_at: string;
  updated_at: string;
  school_locations?: SchoolLocation[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: 'exam' | 'meeting' | 'holiday' | 'task' | 'other';
}

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
}
