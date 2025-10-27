import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Coins, TrendingUp, Gift, Ticket } from "lucide-react";

interface Transaction {
  id: string;
  game_id: string;
  product_id: string;
  user_game_id: string;
  status: string;
  total_price: number;
  payment_method: string;
  points_earned: number;
  created_at: string;
  games: { name: string };
  products: { name: string };
}

interface Voucher {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  points_required: number;
}

interface UserVoucher {
  id: string;
  voucher_id: string;
  is_used: boolean;
  used_at: string | null;
  vouchers: Voucher;
}

export default function Vault() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setLoyaltyPoints(profile.loyalty_points);
      }

      const { data: txData } = await supabase
        .from("transactions")
        .select("*, games(name), products(name)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (txData) {
        setTransactions(txData as any);
      }

      // Fetch available vouchers
      const { data: voucherData } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .order("points_required");

      if (voucherData) {
        setVouchers(voucherData);
      }

      // Fetch user's vouchers
      const { data: userVoucherData } = await supabase
        .from("user_vouchers")
        .select("*, vouchers(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (userVoucherData) {
        setUserVouchers(userVoucherData as any);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleRedeemVoucher = async (voucher: Voucher) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (loyaltyPoints < voucher.points_required) {
      toast({
        title: "Poin Tidak Cukup",
        description: `Anda memerlukan ${voucher.points_required} poin untuk redeem voucher ini`,
        variant: "destructive",
      });
      return;
    }

    setRedeeming(voucher.id);

    try {
      // Deduct points from profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ loyalty_points: loyaltyPoints - voucher.points_required })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Add voucher to user's vouchers
      const { error: voucherError } = await supabase
        .from("user_vouchers")
        .insert({
          user_id: session.user.id,
          voucher_id: voucher.id,
        });

      if (voucherError) throw voucherError;

      toast({
        title: "Voucher Berhasil Diredeem!",
        description: `${voucher.name} telah ditambahkan ke koleksi Anda`,
      });

      // Refresh data
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setLoyaltyPoints(profile.loyalty_points);
      }

      const { data: userVoucherData } = await supabase
        .from("user_vouchers")
        .select("*, vouchers(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (userVoucherData) {
        setUserVouchers(userVoucherData as any);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal redeem voucher. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gradient mb-8 text-center animate-fade-in">Cool Loyalty Vault</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass border-border animate-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Poin Loyalty Anda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">{loyaltyPoints}</div>
              <p className="text-sm text-muted-foreground mt-2">
                1 poin = Rp 10.000 transaksi
              </p>
            </CardContent>
        </Card>

        {/* Available Vouchers */}
        <Card className="glass border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Tukar Poin dengan Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada voucher tersedia</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="p-4 rounded-lg bg-card border border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">{voucher.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{voucher.description}</p>
                    <div className="text-2xl font-bold text-primary">{voucher.discount_percentage}% OFF</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{voucher.points_required} poin</span>
                      <Button
                        size="sm"
                        onClick={() => handleRedeemVoucher(voucher)}
                        disabled={loyaltyPoints < voucher.points_required || redeeming === voucher.id}
                      >
                        {redeeming === voucher.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Redeem"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User's Vouchers */}
        <Card className="glass border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Voucher Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userVouchers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Anda belum memiliki voucher</p>
            ) : (
              <div className="space-y-3">
                {userVouchers.map((uv) => (
                  <div key={uv.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                    <div className="flex-1">
                      <h3 className="font-semibold">{uv.vouchers.name}</h3>
                      <p className="text-sm text-muted-foreground">{uv.vouchers.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{uv.vouchers.discount_percentage}%</div>
                      <Badge variant={uv.is_used ? "secondary" : "default"}>
                        {uv.is_used ? "Terpakai" : "Tersedia"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Total Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{transactions.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Transaksi berhasil
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                    <div className="flex-1">
                      <h3 className="font-semibold">{tx.games.name}</h3>
                      <p className="text-sm text-muted-foreground">{tx.products.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Rp {tx.total_price.toLocaleString("id-ID")}</div>
                      <Badge variant={tx.status === "success" ? "default" : "destructive"} className="mt-1">
                        {tx.status}
                      </Badge>
                      <p className="text-xs text-primary mt-1">+{tx.points_earned} poin</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}