'use client'
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground"; 

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFFFF] to-[#E6E6E6] flex flex-col">
      <Navbar />


      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-16">
        <ParticleBackground />
        {/* Hero Section */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            ChatBot <span className="text-blue-500">AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the power of AI conversation. Get instant responses, creative assistance, and intelligent insights at your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              href="/auth/login"
              className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200 text-lg min-w-[200px]"
            >
              Start Chatting
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors duration-200 text-lg min-w-[200px]"
            >
              Sign In
            </Link>
          </div>

          {/* Sign up link */}
          <p className="text-gray-500 pt-4">
            New here?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 px-4">
          {/* Card 1 */}
          <div className="card">
            <div className="z-10 text-center px-4">
              <div className="mb-4">
                <svg className="w-8 h-8 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2>Lightning Fast</h2>
              <p className="text-sm text-gray-300 mt-2">
                Get instant responses powered by advanced AI technology
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div className="z-10 text-center px-4">
              <div className="mb-4">
                <svg className="w-8 h-8 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2>Smart & Creative</h2>
              <p className="text-sm text-gray-300 mt-2">
                From problem-solving to creative writing, we've got you covered
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div className="z-10 text-center px-4">
              <div className="mb-4">
                <svg className="w-8 h-8 mx-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2>Secure & Private</h2>
              <p className="text-sm text-gray-300 mt-2">
                Your conversations are protected with enterprise-grade security
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="card">
            <div className="z-10 text-center px-4">
              <div className="mb-4">
                <svg className="w-8 h-8 mx-auto text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2>24/7 Support</h2>
              <p className="text-sm text-gray-300 mt-2">
                Our AI is always available to help you—day or night.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="card">
            <div className="z-10 text-center px-4">
              <div className="mb-4">
                <svg className="w-8 h-8 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a4 4 0 018 0v6m-4 4a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <h2>Personalized</h2>
              <p className="text-sm text-gray-300 mt-2">
                Tailored answers and memory make your experience unique.
              </p>
            </div>
          </div>
        </div>


      </main>

      <Footer />
    </div>
  );
}