import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationFormSimple } from "@/components/RegistrationFormSimple";
import { RegistrationFormRobust } from "@/components/RegistrationFormRobust";
import { WebsiteStatusOverlay } from "@/components/WebsiteStatusOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

const Index = () => {
  const [formType, setFormType] = useState<'loading' | 'simple' | 'robust' | 'full'>('loading');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Determine which form to use based on URL params and environment
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('simple') || urlParams.has('debug')) {
      setFormType('simple');
    } else if (urlParams.has('robust')) {
      setFormType('robust');
    } else {
      // Try full form first, fallback to robust if issues
      setFormType('robust'); // Start with robust for stability
    }
  }, []);

  // Show loading until client-side hydration
  if (!isClient || formType === 'loading') {
    return (
      <>
        <Helmet>
          <title>FUN BIKE CONTEST VOL 1</title>
          <meta name="description" content="Daftar sekarang untuk acara Fun Bike Contest 2026. Pilih paket Contest atau Meet Up dan bergabung!" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  const renderForm = () => {
    switch (formType) {
      case 'simple':
        return <RegistrationFormSimple />;
      case 'robust':
        return <RegistrationFormRobust />;
      case 'full':
        return <RegistrationForm />;
      default:
        return <RegistrationFormRobust />;
    }
  };

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
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/?simple=true';
                    }
                  }}
                  className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Gunakan Form Sederhana
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Muat Ulang Halaman
                </button>
              </div>
            </div>
          </div>
        }
      >
        {renderForm()}
      </ErrorBoundary>
      <WebsiteStatusOverlay />
    </>
  );
};

export default Index;
