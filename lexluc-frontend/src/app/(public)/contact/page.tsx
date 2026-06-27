'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Clock,
  Headphones,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { contactsAPI } from '@/lib/api';
import { Input, Textarea, Button } from '@/components/common/UI';
import { useToast } from '@/lib/hooks';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/lib/constants';
import { CreateContactRequest } from '@/types';

const socialIcons: Record<string, ReactNode> = {
  instagram: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8ZM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2ZM17.6 6.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" /></svg>,
  linkedin: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.98H3.64V20h3.3V8.98ZM5.29 4A1.92 1.92 0 1 1 5.3 7.86 1.92 1.92 0 0 1 5.29 4ZM20.36 13.4c0-3.3-1.76-4.84-4.12-4.84a3.55 3.55 0 0 0-3.2 1.76V8.98H9.82V20h3.25v-5.8c0-1.54.92-2.38 2.1-2.38 1.13 0 1.88.7 1.88 2.38V20h3.3Z" /></svg>,
  x: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2h3.08l-6.74 7.7L23.2 22h-6.2l-4.86-6.35L6.58 22H3.5l7.2-8.23L2.96 22h6.36l4.39 5.8L18.9 2Zm-1.08 17.9h1.7L8.45 4.08h-1.8Z" /></svg>,
  youtube: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.4.48A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.48 9.4.48 9.4.48s7.55 0 9.4-.48a3 3 0 0 0 2.1-2.12A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z" /></svg>,
  tiktok: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 7.8V4.3h-3.35A5.7 5.7 0 0 1 12.7 1.5V.5H9.35v14.1a3.35 3.35 0 1 1-3.35-3.35c.2 0 .4.02.6.05V7.84a6.85 6.85 0 1 0 6.1 6.8V10.9a2.35 2.35 0 0 0 1.65 2.24v3.2A5.7 5.7 0 0 1 9.35 20.7a6.7 6.7 0 1 1 6.7-6.7V3.65A2.35 2.35 0 0 0 21 7.8Z" /></svg>,
};

const fadeIn = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65 } },
};

const limits = {
  fullName: 120,
  email: 255,
  phone: 40,
  company: 120,
  subject: 160,
  message: 5000,
};

export default function ContactPage() {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState<CreateContactRequest>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const remainingMessage = limits.message - formData.message.length;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const name = formData.fullName.trim();

    if (name.length < 2) nextErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (formData.phone && !/^\+?[0-9\s().-]{7,30}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number';
    }
    if (!formData.subject.trim()) nextErrors.subject = 'Subject is required';
    if (formData.subject.length > limits.subject) nextErrors.subject = `Subject must be ${limits.subject} characters or fewer`;
    if (!formData.message.trim()) nextErrors.message = 'Message is required';
    if (formData.message.length > limits.message) nextErrors.message = `Message must be ${limits.message} characters or fewer`;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) return;

    if (!validateForm()) {
      showError('Please fix the highlighted fields');
      return;
    }

    try {
      setLoading(true);
      await contactsAPI.create({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || undefined,
        company: formData.company?.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      success('Message sent successfully. We will respond shortly.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        honeypot: '',
      });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      showError((err as Error).message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[72vh] bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-blue-100 ring-1 ring-white/15 mb-6">
              <ShieldCheck size={18} />
              Secure inquiry management
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Let&apos;s build your next global opportunity.
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl leading-relaxed">
              Send us a message and our team will respond with tailored support for tourism, logistics, agriculture, mining, and business services.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[
                { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
                { icon: Headphones, label: 'Support', value: 'Business days' },
                { icon: ShieldCheck, label: 'Spam Protected', value: 'Secure form' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12 }}
                  className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15"
                >
                  <item.icon className="text-blue-300 mb-3" size={22} />
                  <p className="text-sm text-gray-300">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">Reach our team directly through any official channel below.</p>
              <div className="mt-6 grid gap-4">
                <a href={`mailto:${CONTACT_INFO.email}`} className="group flex items-start gap-4 rounded-2xl bg-gray-50 p-5 transition hover:bg-blue-50 hover:shadow-md">
                  <div className="rounded-xl bg-blue-600 p-3 text-white group-hover:scale-105 transition"><Mail /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-blue-700 break-all">{CONTACT_INFO.email}</p>
                  </div>
                </a>
                {CONTACT_INFO.phones.map((phone, index) => (
                  <a key={phone} href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 rounded-2xl bg-gray-50 p-5 transition hover:bg-green-50 hover:shadow-md">
                    <div className="rounded-xl bg-green-600 p-3 text-white group-hover:scale-105 transition"><Phone /></div>
                    <div>
                      <p className="font-semibold text-gray-900">WhatsApp</p>
                      <p className="text-gray-700">{CONTACT_INFO.phoneDisplay[index]}</p>
                    </div>
                  </a>
                ))}
                <a href={CONTACT_INFO.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 rounded-2xl bg-gray-50 p-5 transition hover:bg-purple-50 hover:shadow-md">
                  <div className="rounded-xl bg-purple-600 p-3 text-white group-hover:scale-105 transition"><MapPin /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Office Address</p>
                    <p className="text-gray-700">{CONTACT_INFO.address}</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white rounded-3xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-2">Follow LexLuc Global</h2>
              <p className="text-gray-300 mb-6">Stay connected across our official social media channels.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(SOCIAL_LINKS).map(([platform, data], index) => (
                  <motion.a
                    key={platform}
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/15 transition hover:bg-white/20"
                  >
                    <div className="mx-auto mb-2 text-blue-200">{socialIcons[platform]}</div>
                    <p className="text-sm font-semibold">{data.label}</p>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.form
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                <p className="text-gray-600 mt-1">All fields marked required are needed to process your inquiry.</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3 text-blue-600"><MessageSquare /></div>
            </div>

            {submitted && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-green-800 flex gap-3">
                <CheckCircle2 className="mt-0.5" size={20} />
                <div>
                  <p className="font-semibold">Inquiry received</p>
                  <p className="text-sm">We&apos;ve saved your message and sent a confirmation email.</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-5">
              <Input label="Full Name" type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} error={errors.fullName} required maxLength={limits.fullName} />
              <Input label="Email Address" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} required maxLength={limits.email} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Phone Number" type="tel" name="phone" placeholder="+234 800 000 0000" value={formData.phone} onChange={handleChange} error={errors.phone} maxLength={limits.phone} />
                <Input label="Company Name (Optional)" type="text" name="company" placeholder="Company name" value={formData.company} onChange={handleChange} maxLength={limits.company} />
              </div>
              <Input label="Subject" type="text" name="subject" placeholder="How can we help?" value={formData.subject} onChange={handleChange} error={errors.subject} required maxLength={limits.subject} />
              <div>
                <Textarea label="Message" name="message" placeholder="Tell us about your inquiry..." rows={7} value={formData.message} onChange={handleChange} error={errors.message} required maxLength={limits.message} />
                <div className={`mt-2 text-sm ${remainingMessage < 250 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {remainingMessage} characters remaining
                </div>
              </div>

              <label className="pointer-events-none absolute -left-[9999px]" htmlFor="website">
                Website
                <input id="website" name="honeypot" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={handleChange} />
              </label>

              <Button type="submit" loading={loading} className="w-full text-base py-6" disabled={submitted}>
                {submitted ? (
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 size={20} />Message Sent</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Send size={18} />Send Message</span>
                )}
              </Button>

              <p className="flex items-start gap-2 text-sm text-gray-500">
                <ShieldCheck size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />
                Your submission is rate-limited, validated, and stored securely for our team to review.
              </p>
            </div>
          </motion.form>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 mt-3">Quick answers before you reach out.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { q: 'How quickly will I get a response?', a: 'Our team reviews inquiries during business hours and typically responds within 24 hours.' },
              { q: 'Can I request a custom service package?', a: 'Yes. Include your requirements in the message field and our team will prepare a tailored response.' },
              { q: 'Is my information protected?', a: 'We validate, sanitize, rate-limit, and securely store every inquiry submitted through this form.' },
            ].map((faq) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100"
              >
                <AlertCircle className="text-blue-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 lg:p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold">Ready to start a conversation?</h2>
          <p className="mt-3 text-blue-50 max-w-2xl mx-auto">Send your inquiry today and let LexLuc Global Services help you move forward with confidence.</p>
          <a href="mailto:Lexlucglobalservices@gmail.com" className="inline-flex mt-6 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition">
            <Mail size={18} />
            Email Us Directly
          </a>
        </motion.div>
      </section>
    </main>
  );
}
