import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Game {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  description: string | null;
  is_active: boolean;
}

const Admin = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    thumbnail_url: "",
    description: "",
    is_active: true,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (error || !roleData) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki akses admin",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchGames();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("name");

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        slug: game.slug,
        thumbnail_url: game.thumbnail_url,
        description: game.description || "",
        is_active: game.is_active,
      });
    } else {
      setEditingGame(null);
      setFormData({
        name: "",
        slug: "",
        thumbnail_url: "",
        description: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug || !formData.thumbnail_url) {
      toast({
        title: "Error",
        description: "Nama, slug, dan thumbnail harus diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingGame) {
        const { error } = await supabase
          .from("games")
          .update(formData)
          .eq("id", editingGame.id);

        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Game berhasil diupdate",
        });
      } else {
        const { error } = await supabase
          .from("games")
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Berhasil",
          description: "Game berhasil ditambahkan",
        });
      }
      setDialogOpen(false);
      fetchGames();
    } catch (error: any) {
      console.error("Error saving game:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan game",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus game ini?")) return;

    try {
      const { error } = await supabase
        .from("games")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Berhasil",
        description: "Game berhasil dihapus",
      });
      fetchGames();
    } catch (error: any) {
      console.error("Error deleting game:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus game",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Kelola game dan produk</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Game
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGame ? "Edit Game" : "Tambah Game Baru"}</DialogTitle>
              <DialogDescription>
                {editingGame ? "Update informasi game" : "Tambahkan game baru ke sistem"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Game</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Mobile Legends"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Contoh: mobile-legends"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi game..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Game Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingGame ? "Update" : "Tambah"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id}>
            <CardHeader>
              <img
                src={game.thumbnail_url}
                alt={game.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <CardTitle className="flex items-center justify-between">
                {game.name}
                <span className={`text-xs px-2 py-1 rounded ${game.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {game.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </CardTitle>
              <CardDescription>{game.slug}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {game.description || "Tidak ada deskripsi"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(game)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(game.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Belum ada game</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Game Pertama
          </Button>
        </div>
      )}
    </div>
  );
};

export default Admin;
