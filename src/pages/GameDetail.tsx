import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Wallet, Ticket } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Game {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency_amount: number;
}

interface UserVoucher {
  id: string;
  voucher_id: string;
  is_used: boolean;
  vouchers: {
    id: string;
    name: string;
    discount_percentage: number;
  };
}

const transactionSchema = z.object({
  userGameId: z.string().min(3, "User ID minimal 3 karakter").max(50),
  productId: z.string().uuid("Pilih paket terlebih dahulu"),
  paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
});

export default function GameDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  
  const [formData, setFormData] = useState({
    userGameId: "",
    productId: "",
    paymentMethod: "",
  });
  
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Get game data
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (gameError || !gameData) {
        toast({
          title: "Error",
          description: "Game tidak ditemukan",
          variant: "destructive",
        });
        navigate("/games");
        return;
      }

      setGame(gameData);

      // Get products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("game_id", gameData.id)
        .eq("is_active", true)
        .order("price");

      if (productsData) {
        setProducts(productsData);
      }

      // Get user's available vouchers
      if (session?.user) {
        const { data: voucherData } = await supabase
          .from("user_vouchers")
          .select("*, vouchers(*)")
          .eq("user_id", session.user.id)
          .eq("is_used", false);

        if (voucherData) {
          setUserVouchers(voucherData as any);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, navigate, toast]);

  const handleProductSelect = (product: Product) => {
    setFormData({ ...formData, productId: product.id });
    setOriginalPrice(product.price);
    calculatePrice(product.price, selectedVoucher);
  };

  const calculatePrice = (basePrice: number, voucherId: string) => {
    if (!voucherId) {
      setSelectedPrice(basePrice);
      return;
    }

    const voucher = userVouchers.find(v => v.id === voucherId);
    if (voucher) {
      const discount = basePrice * (voucher.vouchers.discount_percentage / 100);
      setSelectedPrice(Math.round(basePrice - discount));
    } else {
      setSelectedPrice(basePrice);
    }
  };

  const handleVoucherChange = (voucherId: string) => {
    setSelectedVoucher(voucherId);
    calculatePrice(originalPrice, voucherId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login terlebih dahulu untuk melakukan transaksi",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const validated = transactionSchema.parse(formData);
      setProcessing(true);

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        game_id: game!.id,
        product_id: validated.productId,
        user_game_id: validated.userGameId,
        payment_method: validated.paymentMethod,
        total_price: selectedPrice,
        status: "success", // Simulasi sukses
      });

      if (error) throw error;

      // Mark voucher as used if applied
      if (selectedVoucher) {
        await supabase
          .from("user_vouchers")
          .update({ is_used: true, used_at: new Date().toISOString() })
          .eq("id", selectedVoucher);
      }

      toast({
        title: "Transaksi Berhasil!",
        description: `Top-up berhasil! Poin loyalty telah ditambahkan ke Vault Anda.`,
      });

      navigate("/vault");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validasi Gagal",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Terjadi kesalahan. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: "gopay", name: "GoPay", icon: Wallet },
    { id: "ovo", name: "OVO", icon: Wallet },
    { id: "dana", name: "DANA", icon: Wallet },
    { id: "bank", name: "Transfer Bank", icon: CreditCard },
  ];

  const isFormValid = formData.userGameId && formData.productId && formData.paymentMethod;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-6 p-6 rounded-xl glass border border-border">
            <img
              src={game!.thumbnail_url}
              alt={game!.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">{game!.name}</h1>
              <p className="text-muted-foreground">{game!.description}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: User ID */}
          <Card className="glass border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <h2 className="text-xl font-bold">Masukkan User ID</h2>
              </div>
              <div className="space-y-2">
                <Label htmlFor="userId">User ID / Player ID</Label>
                <Input
                  id="userId"
                  placeholder="Masukkan User ID Anda"
                  value={formData.userGameId}
                  onChange={(e) => setFormData({ ...formData, userGameId: e.target.value })}
                  className="bg-card border-border focus:border-primary"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Select Product */}
          <Card className="glass border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <h2 className="text-xl font-bold">Pilih Paket</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`interactive-card ${formData.productId === product.id ? "selected" : ""}`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-lg font-bold text-primary">{product.currency_amount}</div>
                      <div className="text-sm text-muted-foreground">{product.name}</div>
                      <div className="text-base font-semibold">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Voucher (Optional) */}
          {userVouchers.length > 0 && formData.productId && (
            <Card className="glass border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <h2 className="text-xl font-bold">Gunakan Voucher (Opsional)</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voucher">Pilih Voucher</Label>
                  <Select value={selectedVoucher} onValueChange={handleVoucherChange}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Pilih voucher (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tidak pakai voucher</SelectItem>
                      {userVouchers.map((uv) => (
                        <SelectItem key={uv.id} value={uv.id}>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            {uv.vouchers.name} - {uv.vouchers.discount_percentage}% OFF
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedVoucher && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary">
                      <span className="text-sm">Harga Asli:</span>
                      <span className="text-sm line-through">Rp {originalPrice.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment Method */}
          <Card className="glass border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {userVouchers.length > 0 && formData.productId ? "4" : "3"}
                </div>
                <h2 className="text-xl font-bold">Pilih Pembayaran</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                      className={`interactive-card ${formData.paymentMethod === method.id ? "selected" : ""}`}
                    >
                      <div className="text-center space-y-2">
                        <Icon className="w-8 h-8 mx-auto text-primary" />
                        <div className="text-sm font-semibold">{method.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary-glow text-lg py-6"
            disabled={!isFormValid || processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Beli Sekarang - Rp {selectedPrice.toLocaleString("id-ID")}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}