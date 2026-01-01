import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

export function RegistrationFormSimple() {
  const [formData, setFormData] = useState({
    fullName: "",
    whatsapp: "",
    packageType: "contest"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Form submitted! (Simple version for debugging)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 relative">
      <main className="container px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Daftar Sekarang!
            </h2>
            <p className="text-orange-100 text-base">
              Form Pendaftaran (Simple Version)
            </p>
          </div>

          {/* Simple Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white/95 rounded-3xl shadow-xl p-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Paket</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="packageType"
                    value="contest"
                    checked={formData.packageType === "contest"}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value }))}
                  />
                  <span>Contest - Rp 350.000</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="packageType"
                    value="meetup"
                    checked={formData.packageType === "meetup"}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageType: e.target.value }))}
                  />
                  <span>Meet Up - Rp 150.000</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Kirim Pendaftaran (Test)
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ⚠️ Ini adalah versi sederhana untuk debugging
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Muat Ulang Halaman
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}