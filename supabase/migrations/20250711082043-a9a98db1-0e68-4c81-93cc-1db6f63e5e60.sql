-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  school_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
  auth.uid() IN (sender_id, receiver_id)
);

CREATE POLICY "Users can send messages to school users" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM user_roles ur1, user_roles ur2
    WHERE ur1.user_id = auth.uid() 
    AND ur2.user_id = receiver_id
    AND ur1.school_id = ur2.school_id
    AND ur1.is_active = true 
    AND ur2.is_active = true
  )
);

-- Create policies for updating and deleting messages (sender only)
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (auth.uid() = sender_id);

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;