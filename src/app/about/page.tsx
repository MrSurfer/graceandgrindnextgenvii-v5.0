import { Shield, BookOpen, Users, Zap } from "lucide-react";

export const metadata = {
  title: "About Us | GraceAndGrind",
  description: "Learn more about our mission and the team behind GraceAndGrind.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-12 flex flex-col items-center text-center bg-gray-950">
        <div className="max-w-4xl w-full relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> Our Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            Raising the next generation with <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">purpose.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            GraceAndGrind is dedicated to providing high-quality, practical resources that bridge the gap between traditional parenting and intentional excellence.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We believe parenting should be transformative, not just transactional. Here is what drives us every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Intentional Excellence</h3>
              <p className="text-gray-400 leading-relaxed">
                We focus on actionable wisdom. Our courses are designed to teach you not just the "what", but the "why" behind the values you instill.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Village Built</h3>
              <p className="text-gray-400 leading-relaxed">
                Raising children takes a village. We foster a supportive environment where parents collaborate and grow as a global community.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Generational Impact</h3>
              <p className="text-gray-400 leading-relaxed">
                We meticulously curate our content. Every lesson, video, and resource is crafted to ensure a lasting positive impact on your family legacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Foundation */}
      <section className="py-24 px-6 lg:px-12 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">A Spiritual Calling</h2>
            <p className="text-gray-400 text-lg">
              Our mission is driven by timeless principles of community and shared growth.
            </p>
          </div>
          
          <div className="space-y-12">
            <div className="relative p-10 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BookOpen className="w-32 h-32 text-amber-500" />
              </div>
              <p className="text-2xl md:text-3xl font-medium text-amber-500 mb-6 leading-relaxed italic">
                "As iron sharpens iron, so one person sharpens another."
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-amber-500/50"></div>
                <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Proverbs 27:17</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                This scripture reminds us that our purpose is to strengthen and uplift one another, to challenge each other, and to grow together in our faith.
              </p>
            </div>

            <div className="relative p-10 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users className="w-32 h-32 text-blue-500" />
              </div>
              <p className="text-2xl md:text-3xl font-medium text-blue-400 mb-6 leading-relaxed italic">
                "Carry each other's burdens, and in this way, you will fulfill the law of Christ."
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-blue-500/50"></div>
                <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Galatians 6:2</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                We are called to support one another and bear each other’s burdens in love and unity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">The GraceAndGrind Story</h2>
          <div className="prose prose-invert prose-amber max-w-none text-left text-gray-300">
            <p>
              It started with a simple observation: modern life moves fast, and often the most important job in the world — parenting — gets pushed to the background or managed by trial and error. Parents were feeling overwhelmed, lacking a roadmap for raising children with clear values in a complex world.
            </p>
            <p>
              GraceAndGrind was founded to solve this problem. We wanted to create a platform that felt less like a clinical classroom and more like a heart-to-heart mentorship session with an experienced mentor. A place where complex parenting challenges are broken down into digestible, encouraging, and actionable steps.
            </p>
            <p>
              Today, our platform hosts experts sharing their hard-earned wisdom with parents across the globe. Whether you're welcoming your first child or navigating the teenage years, GraceAndGrind is here to help you parent with intentional excellence.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
