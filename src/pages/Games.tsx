import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Game {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  description: string;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setGames(data);
      }
      setLoading(false);
    };

    fetchGames();
  }, []);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12 space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Pilih Game</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Temukan game favoritmu dan mulai top-up dengan harga terbaik
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="glass animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Game tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {filteredGames.map((game) => (
              <Link key={game.id} to={`/game/${game.slug}`}>
                <Card className="interactive-card group overflow-hidden h-full">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={game.thumbnail_url}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-lg truncate">{game.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {game.description || "Top-up cepat dan aman"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}