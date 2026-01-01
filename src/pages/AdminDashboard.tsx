import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { motorcycleIcon, pictureIcon, categoryIcon, platIcon, rupiahIcon } from "@/assets";

import {
  LogOut,
  Search,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Check,
  MapPin,
  Calendar,
  Filter,
  Loader2,
  Trash2,
  RefreshCw,
  Settings,

} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Registration {
  id: string;
  full_name: string;
  whatsapp: string;
  vehicle_type?: string;
  plate_number?: string;
  category?: string;
  package_type: "contest" | "meetup";
  proof_url: string;
  latitude: number | null;
  longitude: number | null;
  status: "pending" | "verified";
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPackage, setFilterPackage] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Registration | null>(null);
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [websiteStatus, setWebsiteStatus] = useState<'open' | 'closed'>('open');
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed'>('open');
  const [statusReason, setStatusReason] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [reopenDate, setReopenDate] = useState('');

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
    fetchWebsiteStatus();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/5tladminmode");
      return;
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!adminUser) {
      await supabase.auth.signOut();
      navigate("/5tladminmode");
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal mengambil data pendaftaran",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data pendaftaran",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      setRegistrations(data || []);
      toast({
        title: "Berhasil",
        description: "Data pendaftaran telah diperbarui",
        duration: 4000,
      });
    }
    setRefreshing(false);
  };

  const fetchWebsiteStatus = async () => {
    const { data, error } = await (supabase as any)
      .from('website_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data && !error) {
      setWebsiteStatus(data.status);
      setSelectedStatus(data.status);
      setStatusReason(data.reason || '');
      setStatusDescription(data.description || '');
      setReopenDate(data.reopen_date || '');
    }
  };

  const updateWebsiteStatus = async () => {
    const { error } = await (supabase as any)
      .from('website_settings')
      .upsert({
        id: 1,
        status: selectedStatus,
        reason: statusReason,
        description: statusDescription,
        reopen_date: reopenDate || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupdate status website",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      setWebsiteStatus(selectedStatus);
      toast({
        title: "Berhasil",
        description: `Website berhasil di${selectedStatus === 'open' ? 'buka' : 'tutup'}`,
        duration: 4000,
      });
      setShowSettings(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/5tladminmode");
  };

  const handleVerify = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("registrations")
      .update({ status: "verified" })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memverifikasi pendaftaran",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Status pembayaran telah diverifikasi",
        duration: 4000,
      });
      fetchRegistrations();
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    // Get the registration to delete the proof image from storage
    const registration = registrations.find(r => r.id === id);
    
    // Delete from database
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus data pendaftaran",
        variant: "destructive",
        duration: 4000,
      });
    } else {
      // Try to delete proof image from storage (optional, won't fail if image doesn't exist)
      if (registration?.proof_url) {
        try {
          const fileName = registration.proof_url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('proofs').remove([fileName]);
          }
        } catch (e) {
          console.log('Could not delete proof image:', e);
        }
      }
      
      toast({
        title: "Berhasil",
        description: "Data pendaftaran telah dihapus",
        duration: 4000,
      });
      fetchRegistrations();
    }
    setDeletingId(null);
    setDeleteConfirmation(null);
  };

  const openWhatsApp = (whatsapp: string, name: string) => {
    const formattedNumber = whatsapp.replace(/^0/, "62").replace(/[^0-9]/g, "");
    const message = encodeURIComponent(`Halo ${name}, terkait pendaftaran Fun Bike...`);
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
  };

  const openMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (type: string) => {
    return type === "contest" ? "Rp 350.000" : "Rp 150.000";
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPackage = filterPackage === "all" || reg.package_type === filterPackage;
    const matchesStatus = filterStatus === "all" || reg.status === filterStatus;
    return matchesSearch && matchesPackage && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    contest: registrations.filter((r) => r.package_type === "contest").length,
    meetup: registrations.filter((r) => r.package_type === "meetup").length,
    revenue:
      registrations.filter((r) => r.package_type === "contest").length * 350000 +
      registrations.filter((r) => r.package_type === "meetup").length * 150000,
    verified: registrations.filter((r) => r.status === "verified").length,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to parse multiple vehicles
  const parseVehicles = (vehicleType: string, plateNumber: string) => {
    const types = vehicleType.split(', ').map(v => v.trim());
    const plates = plateNumber.split(', ').map(p => p.trim());
    
    // Match types with plates
    const vehicles = types.map((type, index) => ({
      type,
      plate: plates[index] || ''
    }));
    
    return vehicles;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 admin-dashboard">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-orange-500/5 rounded-full mix-blend-screen filter blur-3xl animate-blob-1"></div>
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-500/5 rounded-full mix-blend-screen filter blur-3xl animate-blob-2"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" className="rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-white">Dashboard Admin</h1>
              <p className="text-xs text-slate-400">FUN BIKE CONTEST</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="space-y-6">

          {/* Registrations Section */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total */}
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 rounded-2xl transition-all duration-300"></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Total Pendaftar</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Contest */}
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 rounded-2xl transition-all duration-300"></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <img src={motorcycleIcon} alt="Motorcycle" className="h-6 w-6 opacity-70" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Contest</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.contest}</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Meet Up */}
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300"></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <img src={motorcycleIcon} alt="Motorcycle" className="h-6 w-6 opacity-70" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Meet Up</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.meetup}</p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Revenue */}
              <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 rounded-2xl transition-all duration-300"></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <img src={rupiahIcon} alt="Rupiah" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Est. Pendapatan</p>
                    <p className="text-2xl font-bold text-white mt-2">{formatCurrency(stats.revenue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => {
                    setShowSettings(true);
                    // Reset form to current status when opening modal
                    setSelectedStatus(websiteStatus);
                  }}
                  variant="outline" 
                  className="flex-1 bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Website Settings
                </Button>
                
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 hover:border-orange-500/50"
                  variant="outline"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                  {refreshing ? "Memperbarui..." : "Refresh Data"}
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="search-icon-container">
                    <Search className="h-5 w-5 text-slate-500" />
                  </div>
                  <Input
                    placeholder="Cari nama pendaftar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={filterPackage} onValueChange={setFilterPackage}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Paket" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Paket</SelectItem>
                      <SelectItem value="contest">Contest</SelectItem>
                      <SelectItem value="meetup">Meet Up</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Registration Cards */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden animate-fade-in" style={{ animationDelay: "0.6s" }}>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Users className="h-12 w-12 mb-4 opacity-30" />
                  <p>Belum ada pendaftar</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredRegistrations.map((reg, index) => (
                    <div key={reg.id} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 hover:bg-slate-700/20 transition-colors duration-200 admin-card">
                      {/* Header with No and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-base text-slate-400 font-medium">#{index + 1}</span>
                          <h3 className="font-semibold text-white text-xl">{reg.full_name}</h3>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                            reg.status === "verified"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          )}
                        >
                          {reg.status === "verified" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          {reg.status === "verified" ? "Verified" : "Pending"}
                        </span>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        {/* Package */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                            <img src={motorcycleIcon} alt="Package" className="h-3.5 w-3.5 opacity-80" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Paket</p>
                            <span
                              className={cn(
                                "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold",
                                reg.package_type === "contest"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              )}
                            >
                              {reg.package_type === "contest" ? "Contest" : "Meet Up"}
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Tanggal</p>
                            <p className="text-sm text-white font-semibold">
                              {new Date(reg.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 font-medium">Lokasi</p>
                            {reg.latitude && reg.longitude ? (
                              <button
                                onClick={() => openMaps(reg.latitude!, reg.longitude!)}
                                className="location-button text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors whitespace-nowrap text-left block"
                              >
                                Lihat Maps
                              </button>
                            ) : (
                              <p className="text-xs text-slate-500 font-medium">Tidak ada</p>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                            <svg className="h-3.5 w-3.5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-xs text-slate-400 font-medium">WhatsApp</p>
                            <p className="text-xs text-white font-semibold whitespace-nowrap">{reg.whatsapp}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="button-container-fix pt-4 border-t border-slate-700/30 admin-card-actions">
                        <div className="button-group-left">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRegistration(reg)}
                            className="text-white hover:text-white hover:bg-slate-700 admin-action-btn btn-icon-only flex-col px-3 py-2"
                          >
                            <Eye className="h-4 w-4 flex-shrink-0" />
                            <span className="btn-text-responsive text-sm mt-1">Detail</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProofImageUrl(reg.proof_url)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10 admin-action-btn btn-icon-only flex-col px-3 py-2"
                          >
                            <img src={pictureIcon} alt="Picture" className="h-4 w-4 flex-shrink-0" />
                            <span className="btn-text-responsive text-sm mt-1">Bukti</span>
                          </Button>
                        </div>
                        
                        <div className="button-group-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openWhatsApp(reg.whatsapp, reg.full_name)}
                            title="WhatsApp"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10 admin-icon-btn btn-icon-only flex-col px-3 py-2"
                          >
                            <div className="flex items-center justify-center">
                              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                              </svg>
                            </div>
                            <span className="btn-text-responsive text-sm mt-1 font-medium">WA</span>
                          </Button>
                          
                          {reg.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerify(reg.id)}
                              disabled={updatingId === reg.id}
                              title="Verifikasi"
                              className="text-orange-400 hover:bg-orange-500/10 admin-icon-btn btn-icon-only flex-col px-3 py-2"
                            >
                              {updatingId === reg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                              ) : (
                                <Check className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="btn-text-responsive text-sm mt-1">
                                {updatingId === reg.id ? "..." : "OK"}
                              </span>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmation(reg)}
                            disabled={deletingId === reg.id}
                            title="Hapus"
                            className="text-red-400 hover:bg-red-500/10 admin-icon-btn btn-icon-only flex-col px-3 py-2"
                          >
                            {deletingId === reg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                            ) : (
                              <Trash2 className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="btn-text-responsive text-sm mt-1">
                              {deletingId === reg.id ? "..." : "Del"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/50 text-white flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-700/30">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
              Detail Pendaftaran
            </DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
              {/* Header Card with Status */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{selectedRegistration.full_name}</h3>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                      selectedRegistration.status === "verified"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    )}
                  >
                    {selectedRegistration.status === "verified" ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                    {selectedRegistration.status === "verified" ? "Verified" : "Pending"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm text-slate-400 font-medium">WhatsApp</p>
                      <p className="text-sm font-semibold text-white whitespace-nowrap">{selectedRegistration.whatsapp}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Tanggal Daftar</p>
                      <p className="text-sm font-semibold text-white">{formatDate(selectedRegistration.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package & Category Info */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <img src={motorcycleIcon} alt="Package" className="h-5 w-5 opacity-80" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Paket Pendaftaran</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "inline-flex px-3 py-1 rounded-full text-sm font-bold",
                            selectedRegistration.package_type === "contest"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          )}
                        >
                          {selectedRegistration.package_type === "contest" ? "Contest" : "Meet Up"}
                        </span>
                        <span className="text-lg font-bold text-white">
                          {formatPrice(selectedRegistration.package_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRegistration.category && (
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <img 
                          src={categoryIcon} 
                          alt="Category" 
                          className="h-5 w-5"
                          style={{ filter: 'hue-rotate(20deg) saturate(1.5) brightness(1.2)' }}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Kategori</p>
                        <p className="text-lg font-bold text-white">{selectedRegistration.category}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Information */}
              {selectedRegistration.vehicle_type && selectedRegistration.plate_number && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <img src={motorcycleIcon} alt="Motorcycle" className="h-4 w-4" />
                    Informasi Kendaraan
                  </h4>
                  {parseVehicles(selectedRegistration.vehicle_type, selectedRegistration.plate_number).map((vehicle, index) => (
                    <div key={index} className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-slate-600/30">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-orange-500/20">
                          <img src={motorcycleIcon} alt="Motorcycle" className="h-4 w-4 text-orange-400" />
                        </div>
                        <p className="text-sm font-bold text-orange-400">Motor {index + 1}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-700/50">
                            <img src={motorcycleIcon} alt="Type" className="h-4 w-4 opacity-70" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Jenis Kendaraan</p>
                            <p className="font-semibold text-white">{vehicle.type}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-700/50">
                            <img src={platIcon} alt="Plate" className="h-4 w-4 opacity-70" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Nomor Plat</p>
                            <p className="font-semibold text-white">{vehicle.plate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Location */}
              {selectedRegistration.latitude && selectedRegistration.longitude && (
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <MapPin className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 font-medium">Lokasi Pendaftaran</p>
                      <button
                        onClick={() =>
                          openMaps(selectedRegistration.latitude!, selectedRegistration.longitude!)
                        }
                        className="font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-2 mt-1 transition-colors"
                      >
                        <span>Buka di Google Maps</span>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Proof Image */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <img src={pictureIcon} alt="Picture" className="h-4 w-4" />
                  Bukti Transfer
                </h4>
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-slate-600/30">
                  <button
                    onClick={() => setProofImageUrl(selectedRegistration.proof_url)}
                    className="block w-full group"
                  >
                    <img
                      src={selectedRegistration.proof_url}
                      alt="Bukti Transfer"
                      className="w-full rounded-lg border border-slate-600/50 object-cover max-h-64 group-hover:opacity-90 transition-all duration-300 group-hover:scale-[1.02]"
                    />
                    <p className="text-xs text-slate-400 mt-2 group-hover:text-slate-300 transition-colors">
                      Klik untuk memperbesar
                    </p>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700/30">
                <Button
                  variant="outline"
                  className="flex-1 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:border-green-500/50 hover:text-green-300"
                  onClick={() =>
                    openWhatsApp(selectedRegistration.whatsapp, selectedRegistration.full_name)
                  }
                >
                  <div className="flex items-center justify-center mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                    </svg>
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </Button>
                {selectedRegistration.status === "pending" && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
                    onClick={() => {
                      handleVerify(selectedRegistration.id);
                      setSelectedRegistration(null);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Verifikasi
                  </Button>
                )}
              </div>
              
              {/* Delete Button */}
              <div className="pt-2 border-t border-slate-700/30">
                <Button
                  variant="outline"
                  className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300"
                  onClick={() => {
                    setSelectedRegistration(null);
                    setDeleteConfirmation(selectedRegistration);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Data Pendaftaran
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof Image Popup */}
      <Dialog open={!!proofImageUrl} onOpenChange={() => setProofImageUrl(null)}>
        <DialogContent className="max-w-4xl sm:max-w-[95vw] max-h-[95vh] bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/50 text-white p-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-700/30 bg-slate-800/50">
            <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-green-500/20">
                <img src={pictureIcon} alt="Picture" className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-base sm:text-xl">Bukti Transfer</span>
            </DialogTitle>
          </DialogHeader>
          {proofImageUrl && (
            <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-3 sm:p-6">
              {/* Image Container with Modern Frame */}
              <div className="relative bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl border border-slate-600/30">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl sm:rounded-2xl"></div>
                <img
                  src={proofImageUrl}
                  alt="Bukti Transfer"
                  className="w-full rounded-lg sm:rounded-xl object-contain max-h-[50vh] sm:max-h-[70vh] shadow-lg"
                />
                
                {/* Image Overlay Info - Hidden on very small screens */}
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 hidden sm:block">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20">
                          <img src={pictureIcon} alt="Picture" className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold">Bukti Pembayaran</p>
                          <p className="text-xs text-gray-300 hidden sm:block">Klik dan drag untuk memperbesar</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 cursor-pointer hover:bg-blue-500/30 transition-colors" 
                             onClick={() => window.open(proofImageUrl, '_blank')}>
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      // For modern browsers, use fetch and blob
                      const response = await fetch(proofImageUrl);
                      const blob = await response.blob();
                      
                      // Create object URL
                      const url = window.URL.createObjectURL(blob);
                      
                      // Create download link
                      const link = document.createElement('a');
                      link.href = url;
                      
                      // Generate filename with timestamp
                      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                      link.download = `bukti-transfer-${timestamp}.jpg`;
                      
                      // Trigger download
                      document.body.appendChild(link);
                      link.click();
                      
                      // Cleanup
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      
                    } catch (error) {
                      console.error('Download failed:', error);
                      // Fallback method
                      const link = document.createElement('a');
                      link.href = proofImageUrl;
                      link.download = `bukti-transfer-${Date.now()}.jpg`;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="w-full sm:w-auto bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:border-green-500/50 text-sm"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </Button>
                <Button
                  onClick={() => setProofImageUrl(null)}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 text-sm"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          {deleteConfirmation && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Apakah Anda yakin ingin menghapus data pendaftaran:
                </p>
                <p className="font-semibold text-foreground">
                  {deleteConfirmation.full_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deleteConfirmation.whatsapp}
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ Data yang dihapus tidak dapat dikembalikan. Pastikan Anda sudah yakin sebelum menghapus.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(deleteConfirmation.id)}
                  disabled={deletingId === deleteConfirmation.id}
                >
                  {deletingId === deleteConfirmation.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Website Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700/50 text-white flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-700/30">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              Website Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
            {/* Current Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Status Saat Ini</h3>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  websiteStatus === 'open' ? "bg-green-500" : "bg-red-500"
                )}></div>
                <span className="font-medium">
                  {websiteStatus === 'open' ? 'Website Terbuka' : 'Website Ditutup'}
                </span>
              </div>
            </div>

            {/* Status Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Kontrol Website</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setSelectedStatus('open')}
                  className={cn(
                    "justify-start h-auto p-4 text-left",
                    selectedStatus === 'open' 
                      ? "bg-green-500/20 border-green-500/30 text-green-400" 
                      : "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50"
                  )}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-semibold">Buka Website</p>
                      <p className="text-xs opacity-70">Website dapat diakses normal</p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setSelectedStatus('closed')}
                  disabled={websiteStatus === 'closed'}
                  className={cn(
                    "justify-start h-auto p-4 text-left",
                    selectedStatus === 'closed' 
                      ? "bg-red-500/20 border-red-500/30 text-red-400" 
                      : "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50",
                    websiteStatus === 'closed' && "opacity-50 cursor-not-allowed"
                  )}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <p className="font-semibold">Tutup Website</p>
                      <p className="text-xs opacity-70">Website tidak dapat diakses</p>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Warning Message - Only show if website is closed */}
              {websiteStatus === 'closed' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    ℹ️ Website sedang ditutup untuk publik. Admin dapat mengubah status kapan saja.
                  </p>
                </div>
              )}
            </div>

            {/* Status Details Form */}
            {selectedStatus === 'closed' && (
              <div className="space-y-4 bg-slate-800/30 rounded-xl p-4 border border-slate-600/30">
                <h3 className="text-sm font-semibold text-slate-300">Detail Status</h3>
                
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Alasan</label>
                  <Input
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Contoh: Registrasi dibuka pada tanggal 02 Januari 2026"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Deskripsi</label>
                  <Input
                    value={statusDescription}
                    onChange={(e) => setStatusDescription(e.target.value)}
                    placeholder="Contoh: Mohon Bersabar ya"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Tanggal Buka Kembali (Opsional)</label>
                  <Input
                    type="date"
                    value={reopenDate}
                    onChange={(e) => setReopenDate(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-slate-700/30">
            <Button
              variant="outline"
              className="flex-1 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50"
              onClick={() => setShowSettings(false)}
            >
              Tutup
            </Button>
            
            {/* Update Button - Only show if there are changes */}
            {(selectedStatus !== websiteStatus || 
              (selectedStatus === 'closed' && (statusReason || statusDescription || reopenDate))) && (
              <Button
                onClick={updateWebsiteStatus}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Update Website
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
