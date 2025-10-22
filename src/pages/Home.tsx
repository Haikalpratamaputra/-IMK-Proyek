import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Zap, Shield, Gift, ArrowRight } from "lucide-react";

interface Game {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  description: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .limit(6);

      if (!error && data) {
        setGames(data);
      }
      setLoading(false);
    };

    fetchGames();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold">
              <span className="text-gradient glow-text">Top-Up Cepat</span>
              <br />
              <span className="text-foreground">Aman & Banyak Bonus</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform top-up game terpercaya dengan sistem Loyalty Vault. Setiap transaksi dapat poin!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/games">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-glow group">
                  Mulai Top-Up
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/help">
                <Button size="lg" variant="outline" className="border-border hover:border-primary">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <Card className="glass border-border hover:border-primary transition-all duration-300 group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Proses Cepat</h3>
                <p className="text-sm text-muted-foreground">Transaksi selesai dalam hitungan detik</p>
              </CardContent>
            </Card>

            <Card className="glass border-border hover:border-primary transition-all duration-300 group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">100% Aman</h3>
                <p className="text-sm text-muted-foreground">Data dan transaksi terlindungi</p>
              </CardContent>
            </Card>

            <Card className="glass border-border hover:border-primary transition-all duration-300 group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Loyalty Vault</h3>
                <p className="text-sm text-muted-foreground">Kumpulkan poin, tukar voucher</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Game Populer</h2>
            <p className="text-muted-foreground">Pilih game favoritmu dan mulai top-up sekarang</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="glass animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {games.map((game) => (
                <Link key={game.id} to={`/game/${game.slug}`}>
                  <Card className="interactive-card group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={game.thumbnail_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm truncate">{game.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/games">
              <Button variant="outline" size="lg" className="border-border hover:border-primary">
                Lihat Semua Game
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}