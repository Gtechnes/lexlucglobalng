import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lexluc Global Services',
  description: 'Privacy policy and data protection information',
};

export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg">
          <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
          <p className="text-gray-600 mb-4">
            Lexluc Global Services and Tours Limited (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Data Protection</h2>
          <p className="text-gray-600 mb-4">
            We are committed to protecting your personal data and respecting your privacy. This policy explains how we collect, use, and protect your information.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We may collect information about you in the following ways:
          </p>
          <ul className="text-gray-600 list-disc ml-6">
            <li>Information you provide when making a booking or inquiry</li>
            <li>Information collected through cookies and analytics</li>
            <li>Your contact details and communication preferences</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Data</h2>
          <p className="text-gray-600 mb-4">
            Your personal data is used to provide you with our services, respond to your inquiries, and improve our platform.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this privacy policy, please contact us at privacy@lexlucglobal.ng
          </p>
        </div>
      </section>
    </div>
  );
}
