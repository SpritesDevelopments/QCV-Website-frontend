import Link from 'next/link';
import { Zap, Code, Shield, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: <Code className="w-6 h-6" />, title: 'Premium Code', desc: 'Production-ready code solutions and templates.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Secure Downloads', desc: 'Instant, encrypted downloads with purchase verification.' },
    { icon: <Sparkles className="w-6 h-6" />, title: 'Subscriptions', desc: 'Unlock everything with flexible monthly or yearly plans.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Live Support', desc: 'Direct chat with developers, fast turnaround.' },
  ];

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-gray-950 to-accent-900/20" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 gradient-text leading-tight">
            Quantum Code Vault
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Premium digital products, code templates, and developer tools — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Browse Shop <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/subscriptions" className="btn-secondary text-lg px-8 py-3">
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 text-center hover:border-primary-700 transition-colors">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary-900/50 flex items-center justify-center text-primary-400">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto glass-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Create a free account and explore our collection.</p>
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
