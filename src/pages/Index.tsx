import { RegistrationForm } from "@/components/RegistrationForm";
import { WebsiteStatusOverlay } from "@/components/WebsiteStatusOverlay";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>FUN BIKE CONTEST VOL 1</title>
        <meta name="description" content="Daftar sekarang untuk acara Fun Bike Contest 2026. Pilih paket Contest atau Meet Up dan bergabung!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Helmet>
      <RegistrationForm />
      <WebsiteStatusOverlay />
    </>
  );
};

export default Index;
