/**
 * Privacy Policy Component
 * Legal compliance for IP tracking and security monitoring
 */

import { Shield, Eye, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600">
          Kebijakan Privasi untuk Sistem Keamanan Website
        </p>
        <p className="text-sm text-gray-500">
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      <div className="grid gap-6">
        {/* IP Address Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Pengumpulan Alamat IP
            </CardTitle>
            <CardDescription>
              Informasi tentang pengumpulan dan penggunaan alamat IP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Data yang Dikumpulkan:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Alamat IP (Internet Protocol) perangkat Anda</li>
                <li>Informasi User-Agent (jenis browser dan sistem operasi)</li>
                <li>Waktu dan tanggal akses</li>
                <li>Halaman yang diakses</li>
                <li>Lokasi geografis umum (negara, kota) berdasarkan IP</li>
                <li>Penyedia layanan internet (ISP)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tujuan Pengumpulan:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Keamanan website dan perlindungan dari serangan</li>
                <li>Pencegahan spam dan aktivitas berbahaya</li>
                <li>Analisis lalu lintas untuk meningkatkan layanan</li>
                <li>Deteksi dan pencegahan penipuan</li>
                <li>Penegakan syarat dan ketentuan penggunaan</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Langkah-langkah Keamanan
            </CardTitle>
            <CardDescription>
              Bagaimana kami melindungi data Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Perlindungan Data:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Data disimpan dalam database yang aman dan terenkripsi</li>
                <li>Akses terbatas hanya untuk administrator yang berwenang</li>
                <li>Tidak ada penyimpanan data pribadi sensitif</li>
                <li>Sistem monitoring untuk mendeteksi akses tidak sah</li>
                <li>Backup data dilakukan secara berkala</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Rate Limiting & Blocking:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Pembatasan jumlah request per IP untuk mencegah spam</li>
                <li>Pemblokiran sementara untuk IP yang mencurigakan</li>
                <li>Whitelist untuk IP terpercaya</li>
                <li>Blacklist untuk IP berbahaya</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Penyimpanan Data
            </CardTitle>
            <CardDescription>
              Berapa lama data disimpan dan bagaimana dihapus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Periode Penyimpanan:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Log IP:</strong> Maksimal 30 hari</li>
                <li><strong>Rate Limiting:</strong> Reset setiap 24 jam</li>
                <li><strong>Security Events:</strong> Maksimal 90 hari</li>
                <li><strong>Failed Login Attempts:</strong> Dihapus setelah login berhasil atau 24 jam</li>
                <li><strong>Blacklist:</strong> Sesuai durasi yang ditetapkan atau hingga dihapus manual</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Penghapusan Otomatis:</h4>
              <p className="text-sm text-gray-600">
                Sistem secara otomatis menghapus data lama setiap hari untuk mematuhi 
                kebijakan privasi dan mengurangi penyimpanan data yang tidak perlu.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Hak Pengguna
            </CardTitle>
            <CardDescription>
              Hak Anda terkait data yang dikumpulkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Hak Anda:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Mengetahui data apa saja yang dikumpulkan</li>
                <li>Meminta penghapusan data (sesuai ketentuan keamanan)</li>
                <li>Mengajukan keberatan atas pemblokiran IP</li>
                <li>Mendapat informasi tentang pelanggaran data (jika terjadi)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Cara Menghubungi Kami:</h4>
              <p className="text-sm text-gray-600">
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau 
                ingin menggunakan hak Anda, silakan hubungi administrator website.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card>
          <CardHeader>
            <CardTitle>Dasar Hukum</CardTitle>
            <CardDescription>
              Landasan hukum untuk pengumpulan dan pemrosesan data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Dasar Hukum Pengumpulan Data:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Kepentingan Sah:</strong> Melindungi website dari serangan dan spam</li>
                <li><strong>Keamanan:</strong> Mencegah aktivitas berbahaya dan ilegal</li>
                <li><strong>Kinerja Layanan:</strong> Memastikan website berfungsi dengan baik</li>
                <li><strong>Kepatuhan Hukum:</strong> Mematuhi peraturan keamanan siber</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tidak Termasuk Data Pribadi Sensitif:</h4>
              <p className="text-sm text-gray-600">
                Alamat IP tidak dianggap sebagai data pribadi sensitif, namun kami 
                tetap menghormati privasi Anda dan menggunakan data ini hanya untuk 
                tujuan keamanan yang sah.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Kontak</CardTitle>
            <CardDescription>
              Informasi kontak untuk pertanyaan privasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Administrator Website:</strong> Fun Bike Contest
              </p>
              <p>
                <strong>Email:</strong> admin@funbikecontest.com
              </p>
              <p>
                <strong>Tanggung Jawab:</strong> Keamanan dan Privasi Data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Pembaruan Kebijakan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Kebijakan privasi ini dapat diperbarui dari waktu ke waktu. 
              Perubahan akan diumumkan di halaman ini dengan tanggal pembaruan terbaru. 
              Penggunaan website setelah pembaruan berarti Anda menyetujui kebijakan yang baru.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-6">
        <p>
          Kebijakan ini dibuat untuk memastikan transparansi dalam pengumpulan 
          dan penggunaan data untuk tujuan keamanan website.
        </p>
      </div>
    </div>
  );
}