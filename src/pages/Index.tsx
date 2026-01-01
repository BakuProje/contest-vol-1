import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationFormSimple } from "@/components/RegistrationFormSimple";
import { WebsiteStatusOverlay } from "@/components/WebsiteStatusOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Helmet } from "react-helmet-async";

const Index = () => {
  // Use simple form for debugging if there are errors
  const useSimpleForm = process.env.NODE_ENV === 'development' || window.location.search.includes('debug');

  return (
    <>
      <Helmet>
        <title>FUN BIKE CONTEST VOL 1</title>
        <meta name="description" content="Daftar sekarang untuk acara Fun Bike Contest 2026. Pilih paket Contest atau Meet Up dan bergabung!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Helmet>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">🚨</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Error pada Form Pendaftaran
              </h2>
              <p className="text-gray-600 mb-4">
                Menggunakan versi sederhana untuk sementara...
              </p>
              <button
                onClick={() => window.location.href = '/?debug=true'}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Gunakan Form Sederhana
              </button>
            </div>
          </div>
        }
      >
        {useSimpleForm ? <RegistrationFormSimple /> : <RegistrationForm />}
      </ErrorBoundary>
      <WebsiteStatusOverlay />
    </>
  );
};

export default Index;
