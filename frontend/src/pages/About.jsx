import {
  Heart,
  Users,
  Globe,
  Sparkles,
  ShoppingBag,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Heart,
      title: "Authenticity",
      description:
        "Every piece celebrates traditional Ethiopian craftsmanship and cultural heritage.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description:
        "Supporting local artisans and vendors who preserve our rich traditions.",
      color: "from-sky-500 to-blue-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Bringing the beauty of Habesha culture to enthusiasts worldwide.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description:
        "Rigorous quality checks ensure every product meets our high standards.",
      color: "from-amber-500 to-orange-500",
    },
  ];

  const stats = [
    { label: "Happy Customers", value: "5,000+", icon: Users },
    { label: "Products Listed", value: "1,200+", icon: Package },
    { label: "Trusted Vendors", value: "150+", icon: ShoppingBag },
    { label: "Global Deliveries", value: "50+", icon: Globe },
  ];

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-20 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-semibold text-sky-500">About Us</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-sky-600 via-blue-600 to-purple-600 dark:from-sky-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Celebrating Ethiopian Culture
          </h1>

          <p className="text-xl text-(--text-secondary) leading-relaxed mb-4">
            Habesha Wear is more than just a marketplace—it's a celebration of
            Ethiopian heritage, artistry, and tradition. We connect passionate
            artisans with customers who appreciate the timeless beauty of
            traditional Ethiopian clothing and accessories.
          </p>

          <p className="text-lg text-(--text-secondary) leading-relaxed">
            From intricately woven fabrics to handcrafted jewelry, every item
            tells a story of craftsmanship passed down through generations.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card-standard p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 text-white mb-4 shadow-lg shadow-sky-500/30 group-hover:shadow-sky-500/50 transition-all group-hover:rotate-6">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-bold text-(--text-main) mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-(--text-secondary) font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-(--text-main)">
            What Makes Us Special
          </h2>
          <p className="text-lg text-(--text-secondary) max-w-2xl mx-auto">
            We're committed to preserving cultural heritage while providing a
            modern, seamless shopping experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card-standard p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} text-white mb-5 shadow-lg group-hover:shadow-xl transition-all group-hover:rotate-6`}
                >
                  <Icon className="w-8 h-8" strokeWidth={2.5} />
                </div>

                <h3 className="text-2xl font-bold mb-3 text-(--text-main)">
                  {feature.title}
                </h3>

                <p className="text-(--text-secondary) leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="card-standard p-10 md:p-16 max-w-4xl mx-auto text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-sky-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-linear-to-tr from-blue-500/20 to-pink-500/20 rounded-full blur-3xl -z-10" />

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-sky-500 to-blue-600 text-white mb-8 shadow-2xl shadow-sky-500/40">
            <TrendingUp className="w-10 h-10" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-(--text-main)">
            Our Mission
          </h2>

          <p className="text-lg text-(--text-secondary) leading-relaxed mb-6">
            To create a thriving marketplace that empowers Ethiopian artisans,
            preserves cultural traditions, and makes authentic Habesha wear
            accessible to everyone who values quality craftsmanship and cultural
            heritage.
          </p>

          <p className="text-lg text-(--text-secondary) leading-relaxed">
            We believe in fair trade, sustainable practices, and building
            lasting relationships between makers and buyers. Every purchase
            supports local communities and helps keep traditional crafts alive
            for future generations.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4">
        <div className="card-standard bg-linear-to-br from-sky-500 to-blue-600 p-10 md:p-16 max-w-4xl mx-auto text-center border-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Join Our Community
          </h2>

          <p className="text-lg text-sky-50 mb-8 max-w-2xl mx-auto">
            Whether you're a vendor, artisan, or customer, you're part of our
            mission to celebrate and preserve Ethiopian cultural heritage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="btn-primary bg-white text-sky-600 hover:bg-sky-50 shadow-xl hover:shadow-2xl px-8 py-4 text-lg"
            >
              Start Shopping
            </a>
            <a
              href="/register"
              className="btn-primary bg-sky-600 text-white hover:bg-sky-700 border-2 border-white/30 shadow-xl hover:shadow-2xl px-8 py-4 text-lg"
            >
              Become a Vendor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
