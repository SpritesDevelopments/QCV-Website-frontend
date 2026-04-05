import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold gradient-text mb-3">⚡ Quantum Code Vault</h3>
            <p className="text-gray-400 text-sm">
              Premium digital products and code solutions for developers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Quick Links</h4>
            <div className="space-y-1.5">
              <Link href="/shop" className="block text-sm text-gray-400 hover:text-primary-400">Shop</Link>
              <Link href="/subscriptions" className="block text-sm text-gray-400 hover:text-primary-400">Subscriptions</Link>
              <Link href="/services" className="block text-sm text-gray-400 hover:text-primary-400">Services</Link>
              <Link href="/about" className="block text-sm text-gray-400 hover:text-primary-400">About Us</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Support</h4>
            <div className="space-y-1.5">
              <Link href="/start-chat" className="block text-sm text-gray-400 hover:text-primary-400">Contact Support</Link>
              <Link href="/subscriptions" className="block text-sm text-gray-400 hover:text-primary-400">Pricing</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Quantum Code Vault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
