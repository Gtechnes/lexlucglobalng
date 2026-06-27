import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Lexluc Global Services',
  description: 'Terms and conditions for using our services',
};

export default function TermsPage() {
  return (
    <div>
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mt-8 mb-4">Agreement to Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Disclaimer</h2>
          <p className="text-gray-600 mb-4">
            The information provided on this website is for general informational purposes only. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability with respect to the website or the information contained on the website.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            In no event shall Lexluc Global Services and Tours Limited or any of our officers, directors, employees, or agents be liable for any loss or damage arising from your use of this website or services.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Governing Law</h2>
          <p className="text-gray-600 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Information</h2>
          <p className="text-gray-600">
            If you have any questions about these terms, please contact us at legal@lexlucglobal.ng
          </p>
        </div>
      </section>
    </div>
  );
}
