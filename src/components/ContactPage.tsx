import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, ShieldCheck, Clock, MessageSquare } from 'lucide-react';
import { PageRoute } from '../types';

interface ContactPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    department: 'General Support',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DADCE0] shadow-2xs space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>National Citizen Helpdesk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Contact & Support Center
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] max-w-xl">
              Have questions regarding your grievance submission or portal access? Our dedicated support team is available 24/7.
            </p>
          </div>

          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md text-center shrink-0 w-full sm:w-auto">
            <p className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Toll-Free Helpline</p>
            <p className="text-2xl font-black tracking-tight mt-0.5">1915</p>
            <p className="text-[10px] text-blue-200 mt-1">Available 24/7 across India</p>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#DADCE0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">Phone & Helplines</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Toll Free: <strong>1915</strong><br />
              Control Room: <strong>+91 (011) 2301-4455</strong><br />
              WhatsApp AI Bot: <strong>+91 98191 51915</strong>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DADCE0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">Official Email Desk</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              General Inquiries: <strong>support@janseva.gov.in</strong><br />
              Grievance Cell: <strong>helpdesk@janseva.gov.in</strong><br />
              Grievance Nodal Officer: <strong>nodal@janseva.gov.in</strong>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DADCE0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#202124]">Central Headquarters</h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              National Grievance Cell,<br />
              Department of Public Grievances,<br />
              Central Secretariat, New Delhi - 110001
            </p>
          </div>
        </div>

        {/* Contact Form & Emergency Helplines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#DADCE0] shadow-2xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#202124] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Send Support Query</span>
              </h2>
              <p className="text-xs text-[#5F6368]">Fill out the form below and an official executive will get back to you within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">Message Received Successfully!</h3>
                <p className="text-xs text-emerald-800">
                  Your inquiry reference ticket has been generated. Our desk officer will respond to <strong>{formData.emailOrPhone}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#202124] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#202124] mb-1">Email or Phone *</label>
                    <input
                      type="text"
                      required
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                      placeholder="e.g. ananya@gmail.com or 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#202124] mb-1">Concern Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-blue-600 focus:outline-hidden bg-white"
                    >
                      <option value="General Support">General Portal Support</option>
                      <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                      <option value="Water Supply & Sanitation">Water Supply & Sanitation</option>
                      <option value="Electricity Board">Electricity Board</option>
                      <option value="Municipal Corporation">Municipal Corporation</option>
                      <option value="Public Health">Public Health & Medical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#202124] mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of inquiry"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#202124] mb-1">Message Detail *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details or grievance reference number if applicable..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Emergency Helplines Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-md">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Emergency Numbers</span>
              </div>
              <h3 className="text-base font-bold">National Emergency Response</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                For immediate life safety or criminal emergencies, please contact emergency dispatch numbers immediately:
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-semibold text-slate-200">National Emergency Number</span>
                  <span className="font-extrabold text-rose-400 text-sm">112</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-semibold text-slate-200">Police Emergency</span>
                  <span className="font-extrabold text-blue-400 text-sm">100 / 112</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-semibold text-slate-200">Fire & Rescue</span>
                  <span className="font-extrabold text-amber-400 text-sm">101</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-semibold text-slate-200">Ambulance Service</span>
                  <span className="font-extrabold text-emerald-400 text-sm">102 / 108</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-semibold text-slate-200">Women Helpline</span>
                  <span className="font-extrabold text-purple-400 text-sm">1091</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-xs space-y-2 text-blue-900">
              <div className="flex items-center gap-2 font-bold text-blue-800">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Working Hours</span>
              </div>
              <p className="text-blue-800 leading-relaxed">
                Janseva AI Portal: <strong>24/7 Digital Redressal</strong><br />
                Physical Helpdesk Officers: Monday - Saturday (9:00 AM to 6:00 PM IST)
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
