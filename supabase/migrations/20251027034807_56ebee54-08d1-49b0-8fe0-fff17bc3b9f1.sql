-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL,
  points_required INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_vouchers table
CREATE TABLE public.user_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voucher_id UUID NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_voucher FOREIGN KEY (voucher_id) REFERENCES public.vouchers(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS policies for vouchers
CREATE POLICY "Anyone can view active vouchers"
ON public.vouchers
FOR SELECT
USING (is_active = true);

-- RLS policies for user_vouchers
CREATE POLICY "Users can view their own vouchers"
ON public.user_vouchers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vouchers"
ON public.user_vouchers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vouchers"
ON public.user_vouchers
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for vouchers updated_at
CREATE TRIGGER update_vouchers_updated_at
BEFORE UPDATE ON public.vouchers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample vouchers
INSERT INTO public.vouchers (name, description, discount_percentage, points_required) VALUES
('Voucher 5%', 'Diskon 5% untuk pembelian', 5, 10),
('Voucher 10%', 'Diskon 10% untuk pembelian', 10, 25),
('Voucher 15%', 'Diskon 15% untuk pembelian', 15, 50),
('Voucher 20%', 'Diskon 20% untuk pembelian', 20, 100);