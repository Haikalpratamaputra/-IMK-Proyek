import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins, TrendingUp } from "lucide-react";

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

export default function Vault() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

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