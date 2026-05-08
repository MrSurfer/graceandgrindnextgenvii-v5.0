import { Shield, BookOpen, Users, Zap, Heart, Sparkles, Globe, Award } from "lucide-react";

export const metadata = {
  title: "Our Mission | Grace & Grind",
  description: "To be the most trusted and comprehensive learning and resource platform for the Habesha diaspora.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-6 lg:px-12 flex flex-col items-center text-center bg-gray-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl w-full relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> The Habesha Mastery Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight">
            Equipping the <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Habesha Diaspora.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            A digital home where every Ethiopian and Eritrean family can access the tools, knowledge, and community they need to thrive across generations.
          </p>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-950 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" /> Our Inspiration
              </h2>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  The inspiration for this platform comes directly from years of lived experience within the Habesha community—from the men's ministry at EECD, from the youth summer programs, and from conversations with parents seeking guidance and newcomers overwhelmed by the American system.
                </p>
                <p className="text-gray-200 font-medium">
                  Grace & Grind is not a market opportunity we discovered. It is a response to a need we have seen, felt, and been part of.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/10 flex items-center justify-center p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
              <Zap className="w-16 h-16 text-amber-500 mb-4 relative z-10" />
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 relative z-10">Lived Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 rounded-3xl bg-gray-950 border border-gray-800 hover:border-amber-500/30 transition-all group">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-gray-400 text-lg leading-relaxed italic">
              "To be the most trusted and comprehensive learning and resource platform for the Habesha diaspora; a digital home where every Ethiopian and Eritrean family, regardless of where they live in the world, can access the tools, knowledge, and community they need to thrive across generations."
            </p>
          </div>
          <div className="p-10 rounded-3xl bg-gray-950 border border-gray-800 hover:border-blue-500/30 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Grace & Grind NextGen exists to equip Habesha parents with practical, faith-informed parenting tools; empower the next generation with life skills and a strong sense of identity; connect newcomers to the resources they need; and build a sustainable platform that serves as a lasting community institution.
            </p>
          </div>
        </div>
      </section>

      {/* The Challenge We Solve */}
      <section className="py-24 px-6 lg:px-12 bg-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-10">Bridging the Knowledge Gap</h2>
          <div className="p-10 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
            <p className="text-2xl md:text-3xl font-medium text-gray-200 mb-8 leading-relaxed">
              "The core problem is not a lack of capable, knowledgeable people within the Habesha community."
            </p>
            <p className="text-xl md:text-2xl text-amber-500 font-bold mb-8 leading-relaxed">
              The core problem is that their knowledge is not organized, accessible, or delivered in a format that reaches everyone who needs it.
            </p>
            <div className="h-px w-24 bg-amber-500/30 mx-auto mb-8" />
            <p className="text-gray-400 text-lg leading-relaxed">
              Grace & Grind was built specifically to solve this gap. We provide the infrastructure and expertise to organize this profound community wisdom, making it accessible to every Habesha family, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 lg:px-12 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Core Values</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              The principles that guide every decision we make for our community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Community First",
                desc: "We build for people before we build for profit. Every decision starts with asking: does this genuinely serve our community?",
                icon: Users,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                title: "Cultural Integrity",
                desc: "We honor Ethiopian and Eritrean culture, language, and faith. We do not ask our community to assimilate; we meet them where they are.",
                icon: Heart,
                color: "text-red-500",
                bg: "bg-red-500/10"
              },
              {
                title: "Practical Wisdom",
                desc: "We combine faith-grounded values with real-world, actionable knowledge. Inspiration without tools is incomplete.",
                icon: BookOpen,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                title: "Generational Thinking",
                desc: "We measure success not in quarterly revenue but in the impact on families, children, and communities over years and decades.",
                icon: Shield,
                color: "text-green-500",
                bg: "bg-green-500/10"
              },
              {
                title: "Quality Without Compromise",
                desc: "We would rather release fewer courses of exceptional quality than many that are mediocre. Our community deserves the best.",
                icon: Award,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                title: "Radical Accessibility",
                desc: "Critical community resources; newcomer guides, immigration help, resource directories; will always be free. Knowledge should not have a paywall.",
                icon: Zap,
                color: "text-orange-500",
                bg: "bg-orange-500/10"
              }
            ].map((value, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-gray-700 transition-colors">
                <div className={`w-12 h-12 ${value.bg} rounded-xl flex items-center justify-center mb-6`}>
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Community Resource Hub */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
                Radical Accessibility
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">The Free Community Resource Hub</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                We are building more than an education platform; we are building a lifeline. The Resource Hub provides essential tools for navigating life in the diaspora, completely free of charge.
              </p>
            </div>
            <div className="flex items-center gap-2 text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
              <Globe className="w-5 h-5" /> All guides translated to Amharic
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Newcomer Essentials",
                items: ["Location finder (Churches, stores, centers)", "State ID & Driver's License guides", "Social Security Number applications"],
                icon: Globe,
                color: "text-blue-400"
              },
              {
                title: "Immigration & Legal",
                items: ["Free & low-cost legal services", "Asylum process navigation", "USCIS & Legal Aid connections"],
                icon: Shield,
                color: "text-red-400"
              },
              {
                title: "Education & Career",
                items: ["College & FAFSA applications", "Scholarships & Degree evaluation", "Healthcare, IT & Business mentorship"],
                icon: BookOpen,
                color: "text-amber-400"
              },
              {
                title: "Financial Literacy",
                items: ["Banking & Building credit from scratch", "Accessing healthcare benefits", "SNAP/WIC & Housing programs"],
                icon: Zap,
                color: "text-green-400"
              },
              {
                title: "Health & Family",
                items: ["Free/Low-cost health clinics", "Medicaid & CHIP enrollment", "Culturally competent mental health"],
                icon: Heart,
                color: "text-rose-400"
              },
              {
                title: "Employment & Business",
                items: ["Worker rights & Business licensing", "Starting a small business in the US", "Employment resource directory"],
                icon: Users,
                color: "text-purple-400"
              }
            ].map((hub, i) => (
              <div key={i} className="bg-gray-950 border border-gray-800 p-8 rounded-3xl hover:bg-gray-900/50 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gray-900 ${hub.color} border border-gray-800 group-hover:scale-110 transition-transform`}>
                    <hub.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{hub.title}</h3>
                </div>
                <ul className="space-y-3">
                  {hub.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-500 text-sm leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-gray-800/50">
                  <button className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center gap-2">
                    Download PDF Guide <Award className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Sacred Commitment */}
      <section className="py-24 px-6 lg:px-12 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Sacred Commitment</h2>
            <div className="space-y-8 text-gray-400 text-lg md:text-xl leading-relaxed">
              <p>
                Today, a generation of Habesha children grows up caught between two worlds, while their parents navigate a culture and language they are still mastering. Every year, thousands of newcomers arrive needing more than a generic brochure—they need a trusted voice from those who have walked the same path.
              </p>
              <p>
                Grace & Grind NextGen is our answer. Built on faith and community love, we believe that equipping one family strengthens the entire diaspora. Every course, guide, and connection we facilitate is a step toward that mission.
              </p>
              <div className="py-8 px-10 bg-amber-500/5 border border-amber-500/20 rounded-3xl inline-block">
                <p className="text-gray-200 font-semibold">
                  We don't build a business and hope it serves; we build for the community, trusting that if we serve with excellence, the rest will follow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooted in Wisdom */}
      <section className="py-24 px-6 lg:px-12 bg-gray-950 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Rooted in Wisdom</h2>
            <p className="text-gray-400 text-lg">
              Our mission is driven by timeless principles of community and shared growth.
            </p>
          </div>
          
          <div className="relative p-10 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="w-32 h-32 text-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-medium text-amber-500 mb-6 leading-relaxed italic">
              "As iron sharpens iron, so one person sharpens another."
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-amber-500/50"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500 font-mono">Proverbs 27:17</span>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              This scripture reminds us that our purpose is to strengthen and uplift one another, to challenge each other, and to grow together in our faith.
            </p>
          </div>
        </div>
      </section>

      {/* Final Footer Quote */}
      <section className="py-32 px-6 lg:px-12 bg-gray-950 flex flex-col items-center text-center">
        <div className="max-w-3xl w-full relative">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
          <div className="relative z-10">
            <Heart className="w-12 h-12 text-blue-500 mx-auto mb-8 animate-pulse" />
            <p className="text-3xl md:text-5xl font-bold text-gray-100 mb-8 leading-tight italic">
              "Carry each other's burdens, and in this way, you will fulfill the law of Christ."
            </p>
            <p className="text-amber-500 font-mono tracking-widest uppercase mb-12">Galatians 6:2</p>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-xl">This is the heart behind Grace & Grind NextGen.</p>
              <div className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">
                Not a platform. <span className="text-blue-500">A people.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
