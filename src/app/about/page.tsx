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
            Empowering the next generation of <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">innovators.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-mono leading-relaxed">
            GraceAndGrind is dedicated to providing high-quality, accessible education that bridges the gap between theory and practical application.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 lg:px-12 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We believe education should be transformative, not just transactional. Here is what drives us every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Practical Knowledge</h3>
              <p className="text-gray-400 leading-relaxed">
                We focus on real-world skills. Our courses are designed to teach you not just the "how", but the "why" behind the technology you use.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Driven</h3>
              <p className="text-gray-400 leading-relaxed">
                Learning is better together. We foster a supportive environment where students and teachers collaborate and grow as a unit.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Uncompromising Quality</h3>
              <p className="text-gray-400 leading-relaxed">
                We meticulously curate our content. Every lesson, video, and assignment is crafted to ensure the highest educational standards.
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
              It started with a simple observation: traditional education systems were struggling to keep pace with the rapid evolution of technology. Developers were entering the workforce knowing the syntax of a language, but lacking the architectural understanding required to build scalable systems.
            </p>
            <p>
              GraceAndGrind was founded to solve this problem. We wanted to create a platform that felt less like a classroom and more like a mentorship session with a senior engineer. A place where complex concepts are broken down into digestible, engaging pieces.
            </p>
            <p>
              Today, our platform hosts industry experts sharing their hard-earned knowledge with students across the globe. Whether you're writing your first line of code or architecting a distributed backend, GraceAndGrind is here to help you level up.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
