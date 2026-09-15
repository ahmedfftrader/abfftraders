import React from 'react';
import { ContactConfig } from '../types';
import { ShoppingCart, MessageSquare, CreditCard, ShieldCheck } from 'lucide-react';

interface Props {
  contact: ContactConfig;
}

export const BuyingStepsSection: React.FC<Props> = ({ contact }) => {
  return (
    <section id="process-steps-section" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 my-14">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide inline-block relative text-white">
          ⚙️ Process For Buying IDs
          <span className="block w-20 h-1 mt-2.5 mx-auto bg-gradient-to-r from-[#ff9500] to-[#ff3300] rounded-full shadow-lg shadow-orange-500/50"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* STEP 1 */}
        <div className="bg-[#14141c] border border-[#2a2a3a] hover:border-[#ff5500] hover:-translate-y-1.5 rounded-2xl p-6 text-center transition-all duration-300 shadow-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h4 className="text-[#ff9933] font-bold text-lg mb-2">1. ID Select Karo</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Upar available cards se apni pasand ki Free Fire ID ya Guild select karo.
          </p>
        </div>

        {/* STEP 2 */}
        <div className="bg-[#14141c] border border-[#2a2a3a] hover:border-[#ff5500] hover:-translate-y-1.5 rounded-2xl p-6 text-center transition-all duration-300 shadow-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h4 className="text-[#ff9933] font-bold text-lg mb-2">2. WhatsApp Par Baat</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Buy Now button ko dabayein aur seedha WhatsApp par contact karein:{' '}
            <span className="text-emerald-400 font-bold block mt-1">{contact.whatsappDisplay || contact.whatsappNumber}</span>
          </p>
        </div>

        {/* STEP 3 */}
        <div className="bg-[#14141c] border border-[#2a2a3a] hover:border-[#ff5500] hover:-translate-y-1.5 rounded-2xl p-6 text-center transition-all duration-300 shadow-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CreditCard className="w-7 h-7" />
          </div>
          <h4 className="text-[#ff9933] font-bold text-lg mb-2">3. Payment & Screenshot</h4>
          <div className="text-neutral-300 text-sm leading-relaxed bg-black/40 py-2 px-3 rounded-lg border border-neutral-800 mt-2">
            <span className="font-mono font-bold text-amber-400 block text-base">{contact.paymentNumber}</span>
            <span className="text-xs text-neutral-300 font-medium">Name: {contact.paymentName}</span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">{contact.paymentMethods}</span>
          </div>
        </div>

        {/* STEP 4 */}
        <div className="bg-[#14141c] border border-[#2a2a3a] hover:border-[#ff5500] hover:-translate-y-1.5 rounded-2xl p-6 text-center transition-all duration-300 shadow-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h4 className="text-[#ff9933] font-bold text-lg mb-2">4. Security & Delivery</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {contact.deliverySecurityNote ||
              'Agar ID Sale krni hai to First Security Then Payment process. Buying par Payment SS ke baad ID mil jaye gi. 🔥'}
          </p>
        </div>
      </div>
    </section>
  );
};
