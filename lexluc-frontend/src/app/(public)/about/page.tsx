import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Lexluc Global Services',
  description: 'Learn about Lexluc Global Services - our mission, vision, and commitment to excellence',
};

const stats = [
  { value: 25, label: 'Years Experience' },
  { value: 500, label: 'Projects Completed' },
  { value: 200, label: 'Expert Team' },
  { value: 50, label: 'Global Partners' },
];

const coreValues = [
  { title: 'Integrity', icon: '🤝', desc: 'We conduct business with honesty and transparency' },
  { title: 'Excellence', icon: '⚡', desc: 'Delivering world-class solutions and services' },
  { title: 'Innovation', icon: '💡', desc: 'Pioneering creative approaches to industry challenges' },
  { title: 'Sustainability', icon: '🌱', desc: 'Building a better future through responsible practices' },
];

const differentiators = [
  { title: 'Industry Expertise', icon: '🏆', desc: 'Decades of experience across multiple sectors' },
  { title: 'Global Reach', icon: '🌍', desc: 'International presence with local understanding' },
  { title: 'Quality Assurance', icon: '✅', desc: 'ISO certified processes and standards' },
  { title: '24/7 Support', icon: '📞', desc: 'Always available to serve our clients' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              About Lexluc Global Services
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12">
              Excellence in Tourism, Agriculture, Mining, Oil & Gas, Recreation, Transportation & Logistics
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a
                href="/services"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Our Services
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-2xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500/10 rounded-2xl" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-2">
                <div className="bg-white rounded-2xl p-12 h-96 flex items-center justify-center">
                  <span className="text-8xl">🏢</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Lexluc Global Services and Tours Limited is a premier integrated service provider operating across six key sectors. Founded with a vision to bridge continents and industries, we have grown into a trusted partner for businesses and travelers worldwide.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                With over 25 years of industry experience, we deliver world-class solutions tailored to meet the unique needs of each client. Our multidisciplinary approach ensures seamless operations and exceptional results.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building excellence through measurable results and trusted partnerships
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="relative inline-block">
                  <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}+
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Mission & Vision
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Guiding principles that drive our commitment to excellence
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="group relative bg-white rounded-2xl p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To provide innovative, reliable, and sustainable services that create value for our clients, employees, and communities while maintaining the highest standards of integrity and professionalism.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be the leading service provider in West Africa, recognized for our expertise, innovation, and commitment to transforming industries through sustainable solutions and strategic partnerships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The foundation of everything we do and stand for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={value.title}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              What sets us apart in delivering exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((item, index) => (
              <div
                key={item.title}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Let&apos;s create something extraordinary together. Contact us today to discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/contact"
              className="inline-flex items-center px-10 py-4 bg-white text-blue-900 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get in Touch
            </a>
            <a
              href="/services"
              className="inline-flex items-center px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
            >
              View Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}