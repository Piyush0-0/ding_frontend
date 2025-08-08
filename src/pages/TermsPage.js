import React from 'react';
import { Helmet } from "react-helmet";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | DING! - Order food at your table</title>
        <meta name="description" content="Read our terms of service to understand the rules and guidelines for using DING food delivery platform. Learn about user responsibilities and platform policies." />
        <meta name="keywords" content="terms of service, food delivery terms, platform rules, user agreement, delivery terms" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="font-raleway px-6 py-10 max-w-3xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-black">Terms & Conditions</h1>
        <p className="mb-2"><strong>Effective Date:</strong> <span className="text-gray-600">2025-04-12</span></p>
        <p className="mb-4">Welcome to <span className="font-semibold text-blue-600">DING</span>! By using our QR ordering platform, you agree to the following terms:</p>
        <p className="mb-6">By accessing and using DING&apos;s QR ordering platform, you agree to the following terms:</p>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">Usage</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Use the platform for legitimate food ordering only.</li>
          <li>Do not attempt to exploit, hack or misuse the platform.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">Service Availability</h2>
        <p className="mb-4 text-gray-700">
          We may make updates or temporarily disable features to improve the platform. We'll try to give advance notice when possible.
        </p>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">Liability</h2>
        <p className="text-gray-700">
          DING is not responsible for issues related to restaurant service, pricing, or food quality. We just power the ordering experience.
        </p>
      </div>
    </>
  );
};

export default TermsAndConditions;
