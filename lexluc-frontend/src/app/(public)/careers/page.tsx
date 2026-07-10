import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Lexluc Global Services',
  description: 'Join our team and build your career with Lexluc Global Services',
};

export default function CareersPage() {
  return (
    <div>
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">Careers</h1>
          <p className="text-gray-300 mt-2">Join our growing team</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Growth Opportunities', desc: 'Professional development and career advancement' },
                { title: 'Competitive Benefits', desc: 'Attractive compensation and benefits package' },
                { title: 'Inclusive Culture', desc: 'Diverse and welcoming work environment' },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
            <div className="space-y-4">
              {[
                { title: 'Tour Guide', dept: 'Tourism', location: 'Lagos' },
                { title: 'Logistics Manager', dept: 'Transportation', location: 'Lagos' },
                { title: 'Marketing Specialist', dept: 'Marketing', location: 'Lagos' },
              ].map((job, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-gray-600 text-sm">{job.dept} • {job.location}</p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-blue-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">Don't see what you're looking for?</h3>
            <p className="text-gray-600 mb-4">Send us your CV and we'll keep it on file for future opportunities</p>
            <button className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700">
              Send Your CV
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
