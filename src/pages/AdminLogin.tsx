import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bike, Lock, Mail, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdminAndRedirect(session.user.id);
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminAndRedirect = async (userId: string) => {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminUser) {
      navigate("/admin-dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!adminUser) {
        await supabase.auth.signOut();
        throw new Error("Anda tidak memiliki akses admin");
      }

      toast({
        title: "Login berhasil",
        description: "Selamat datang di dashboard admin.",
      });

      navigate("/admin-dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-card rounded-2xl shadow-elevated p-8">
          <div className="flex flex-col items-center mb-8">
            <Logo size="md" className="mb-4 rounded-full" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Masuk ke dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <Bike className="h-5 w-5" />
                  Masuk
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              ← Kembali ke halaman pendaftaran
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
