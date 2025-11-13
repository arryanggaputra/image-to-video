import { Info, Globe, Zap, Shield } from "lucide-react";

function AboutPage() {
  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "URL Processing",
      description:
        "Submit any URL and track its processing status in real-time.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast & Efficient",
      description: "Built with modern technologies for optimal performance.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Reliable",
      description: "Robust error handling and data persistence with SQLite.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl mb-6 mx-auto">
            <Info className="w-6 h-6 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            About ImageToVideoAI
          </h1>

          <p className="text-lg text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern web application for URL submission and processing, built
            with cutting-edge technologies to provide a seamless user
            experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Technology Stack
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Frontend
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React 18 with TypeScript</li>
                <li>• React Router for navigation</li>
                <li>• React Query for server state management</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Lucide React for icons</li>
                <li>• Vite for build tooling</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Backend
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• HonoJS framework</li>
                <li>• Drizzle ORM</li>
                <li>• SQLite database</li>
                <li>• Zod for validation</li>
                <li>• CORS enabled</li>
                <li>• RESTful API design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
