import { Code, Globe, Server, Smartphone, Palette, Shield } from 'lucide-react';

const services = [
  { icon: <Code className="w-8 h-8" />, title: 'Custom Development', desc: 'Bespoke software solutions tailored to your needs.' },
  { icon: <Globe className="w-8 h-8" />, title: 'Web Applications', desc: 'Full-stack web apps with modern frameworks.' },
  { icon: <Server className="w-8 h-8" />, title: 'Backend Systems', desc: 'Scalable APIs, microservices, and integrations.' },
  { icon: <Smartphone className="w-8 h-8" />, title: 'Mobile Apps', desc: 'Cross-platform mobile applications.' },
  { icon: <Palette className="w-8 h-8" />, title: 'UI/UX Design', desc: 'Clean, intuitive interfaces your users will love.' },
  { icon: <Shield className="w-8 h-8" />, title: 'Security Audits', desc: 'Code review and vulnerability assessment.' },
];

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in-up">
      <h1 className="text-4xl font-bold gradient-text mb-4 text-center">Our Services</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        From concept to deployment — we handle every step of the development lifecycle.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <div key={i} className="glass-card p-8 hover:border-primary-700 transition-colors">
            <div className="text-primary-400 mb-4">{s.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
