import React from 'react';
import { Helmet } from "react-helmet";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | DING! - Order food at your table</title>
        <meta name="description" content="Read our privacy policy to understand how DING collects, uses, and protects your personal information when you use our food delivery platform." />
        <meta name="keywords" content="privacy policy, data protection, food delivery privacy, user data, personal information" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/16X16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/32X32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/96X96.png" />
      </Helmet>
      <div className="font-raleway px-6 py-10 max-w-3xl mx-auto text-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-black">Privacy Policy</h1>
        <p className="mb-2"><strong>Effective Date:</strong> <span className="text-gray-600">2025-04-12</span></p>
        <p className="mb-4">
          At <span className="font-semibold text-blue-600">DING</span>, your privacy is important to us. This Privacy Policy explains how we collect,
          use, and protect your information when you use our QR code ordering solution.
        </p>
        <p className="mb-6">
          At DING, we value your privacy. This Privacy Policy outlines how we collect, use,
          and protect your information.
        </p>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Usage data like clicks and time spent</li>
          <li>Device and browser information</li>
          <li>Location if you give us permission</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">How We Use Your Info</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>To improve our QR ordering experience</li>
          <li>To troubleshoot bugs or errors</li>
          <li>To send updates only if you opt-in</li>
        </ul>

        <h2 className="text-xl font-semibold mb-2 mt-6 text-black">Your Rights</h2>
        <p className="text-gray-700 mb-2">
          You can request deletion or modification of your data at any time by contacting us at{' '}
          <a href="mailto:contact@myding.com" className="text-blue-600 underline">contact@myding.com</a>.
        </p>
        <p className="text-gray-700">We never sell your data. <strong>Ever.</strong></p>
      </div>
    </>
  );
};

export default PrivacyPolicy;
