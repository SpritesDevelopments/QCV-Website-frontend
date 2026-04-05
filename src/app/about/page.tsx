export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in-up">
      <h1 className="text-4xl font-bold gradient-text mb-8">About Quantum Code Vault</h1>

      <div className="glass-card p-8 space-y-6 text-gray-300 leading-relaxed">
        <p>
          Quantum Code Vault (QCV) is a premium digital products marketplace built for developers,
          by developers. We provide high-quality code solutions, templates, tools, and resources to
          help you build faster and smarter.
        </p>

        <h2 className="text-2xl font-semibold text-white">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>Production-ready code templates and boilerplates</li>
          <li>Custom development tools and utilities</li>
          <li>Subscription-based access to our full library</li>
          <li>Direct developer support through live chat</li>
          <li>Regular updates and new product releases</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
        <p>
          We believe in making development more accessible. Whether you&apos;re a beginner or a
          seasoned pro, QCV gives you the tools you need to ship products faster.
        </p>
      </div>
    </div>
  );
}
