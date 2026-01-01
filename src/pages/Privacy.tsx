/**
 * Privacy Policy Page
 * Standalone page for privacy policy
 */

import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Fun Bike Contest</title>
        <meta name="description" content="Kebijakan privasi untuk sistem keamanan website Fun Bike Contest" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="container mx-auto px-4">
          <PrivacyPolicy />
        </div>
      </div>
    </>
  );
};

export default Privacy;