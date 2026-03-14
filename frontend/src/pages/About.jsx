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
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: Heart,
      title: "Authenticity",
      description:
        "Every piece celebrates traditional Ethiopian craftsmanship and cultural heritage.",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description:
        "Supporting local artisans and vendors who preserve our rich traditions.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Bringing the beauty of Habesha culture to enthusiasts worldwide.",
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description:
        "Rigorous quality checks ensure every product meets our high standards.",
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
      <div className="container mx-auto px-4 mb-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--color-burgundy)]/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
            <span className="text-sm font-semibold text-[var(--color-gold)]">
              About Us
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-burgundy)] to-[var(--color-burgundy)]">
            Celebrating Ethiopian Culture
          </h1>
          <p className="text-xl text-[var(--text-secondary)] leading-relaxed mb-4">
            Habesha Wear is more than a marketplace—it's a celebration of
            Ethiopian heritage, artistry, and tradition. We connect passionate
            artisans with customers who appreciate the timeless beauty of
            traditional Ethiopian clothing and accessories.
          </p>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            From intricately woven fabrics to handcrafted jewelry, every item
            tells a story of craftsmanship passed down through generations.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card-standard p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-[var(--color-gold)]/10"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-burgundy)] text-white mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="text-3xl font-bold text-[var(--text-main)] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--text-secondary)] font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-[var(--text-main)]">
            What Makes Us Special
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
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
                className="card-standard p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border-[var(--color-gold)]/10"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-burgundy)] text-white mb-5 shadow-lg group-hover:scale-105 transition-transform">
                  <Icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 text-[var(--text-main)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 mb-20">
        <div className="card-standard p-10 md:p-16 max-w-4xl mx-auto text-center relative overflow-hidden border-[var(--color-gold)]/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-gold)]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-burgundy)]/10 rounded-full blur-3xl -z-10" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-burgundy)] text-white mb-8 shadow-xl">
            <TrendingUp className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-[var(--text-main)]">
            Our Mission
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
            To create a thriving marketplace that empowers Ethiopian artisans,
            preserves cultural traditions, and makes authentic Habesha wear
            accessible to everyone who values quality craftsmanship and
            cultural heritage.
          </p>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            We believe in fair trade, sustainable practices, and building
            lasting relationships between makers and buyers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="card-standard p-10 md:p-16 max-w-4xl mx-auto text-center border-0 bg-gradient-to-br from-[var(--color-burgundy)] to-[var(--color-burgundy)]/90 text-white shadow-xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're a vendor, artisan, or customer, you're part of our
            mission to celebrate and preserve Ethiopian cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold bg-[var(--color-gold)] text-[var(--color-burgundy)] hover:bg-[var(--color-gold)]/90 transition-all shadow-lg"
            >
              Start Shopping
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold border-2 border-white/50 text-white hover:bg-white/10 transition-all"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
