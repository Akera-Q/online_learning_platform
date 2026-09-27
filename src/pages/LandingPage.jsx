import React from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import { useAuth } from "../context/AuthContext"

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
        .highlight-mark {
          background: linear-gradient(180deg, transparent 60%, #E9B44C 60%, #E9B44C 88%, transparent 88%);
          padding: 0 2px;
        }
      `}</style>

      <Navbar />

      <main className="flex-grow font-body">
        {/* Hero */}
        <section className="border-b border-[#14213D]/10">
          <div className="container mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="font-body text-sm text-[#5B6472] mb-5 tracking-wide">
                Online learning, done properly
              </p>
              <h1 className="font-display text-[#14213D] text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6">
                Learn at your pace.<br />
                Get <span className="highlight-mark">graded</span> on your merit.
              </h1>
              <p className="text-lg text-[#5B6472] mb-10 max-w-md leading-relaxed">
                Insight Platform brings courses, auto-graded quizzes, and real
                certification together — so finishing a course means something.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={user ? "/profile" : "/register"}
                  className="bg-[#14213D] text-white hover:bg-[#1e2d54] px-7 py-3.5 font-medium transition-colors"
                >
                  {user ? "Open your profile" : "Start learning"}
                </Link>
                <Link
                  to="/courses"
                  className="border border-[#14213D]/30 text-[#14213D] hover:border-[#14213D] px-7 py-3.5 font-medium transition-colors"
                >
                  Browse courses
                </Link>
              </div>
            </div>

            {/* Course card mockup — the hero's visual anchor */}
            <div className="lg:col-span-5">
              <div className="bg-[#14213D] text-white p-8 relative">
                <div className="absolute top-0 right-0 bg-[#E9B44C] text-[#14213D] text-xs font-semibold px-3 py-1">
                  In progress
                </div>
                <p className="text-sm text-white/60 mb-1">Module 04</p>
                <h3 className="font-display text-2xl mb-6">
                  Structures &amp; Algorithms
                </h3>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Quiz average</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="h-1.5 bg-white/15">
                    <div className="h-1.5 bg-[#E9B44C] w-[92%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/15 pt-5 text-sm">
                  <span className="text-white/60">7 of 10 lessons complete</span>
                  <span className="text-[#E9B44C] font-medium">Continue →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats — transcript style */}
        <section className="bg-[#14213D] text-white">
          <div className="container mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              ["120+", "Courses"],
              ["18,000", "Learners"],
              ["94%", "Completion rate"],
              ["6,400", "Certificates issued"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-display text-3xl mb-1">{value}</p>
                <p className="text-sm text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features — syllabus sequence, not icon cards */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-display text-3xl text-[#14213D] mb-2">
              How a course runs
            </h2>
            <p className="text-[#5B6472] mb-12">
              Three steps, start to finish.
            </p>

            <div className="divide-y divide-[#14213D]/10">
              {[
                {
                  n: "01",
                  title: "Enroll and track your progress",
                  body: "Browse the catalog, join a course, and pick up exactly where you left off each time you return.",
                },
                {
                  n: "02",
                  title: "Take auto-graded quizzes",
                  body: "Multiple-choice checkpoints throughout each course give you an instant, honest read on where you stand.",
                },
                {
                  n: "03",
                  title: "Earn your certificate",
                  body: "Finish the requirements and get a certificate that reflects work you actually did.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-6 py-8">
                  <span className="font-display text-2xl text-[#E9B44C] w-10 shrink-0">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-[#14213D] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#5B6472] leading-relaxed max-w-lg">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-[#E9B44C]">
          <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <h2 className="font-display text-2xl md:text-3xl text-[#14213D] max-w-md">
              Your next course is one click away.
            </h2>
            <Link
              to={user ? "/courses" : "/register"}
              className="bg-[#14213D] text-white hover:bg-[#1e2d54] px-8 py-3.5 font-medium transition-colors shrink-0"
            >
              {user ? "Browse courses" : "Create your account"}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage