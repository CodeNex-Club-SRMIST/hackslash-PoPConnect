"use client";

import { useState } from "react";
import dynamic from "next/dynamic";


// Dynamically import 3D component to avoid SSR
const Landing3D = dynamic(() => import("./components/Landing3D").then(mod => mod.default), { ssr: false });

export default function LandingPage() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
      {/* Decorative glowing shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-6 px-8 max-w-6xl mx-auto">
        <span className="text-3xl font-extrabold text-white tracking-tight font-[Poppins]">
          HomieFinder
        </span>
        <div>
          <button
            onClick={() => setShowLogin(true)}
            className="mr-4 text-cyan-300 hover:text-white transition font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => setShowSignup(true)}
            className="bg-cyan-400 text-[#0a0f2c] px-5 py-2 rounded-lg font-bold shadow hover:bg-cyan-300 hover:text-[#0a0f2c] transition"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col md:flex-row items-center justify-center text-center md:text-left px-4 max-w-6xl mx-auto w-full">
        <div className="flex-1 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight font-[Poppins]">
            Start <span className="text-cyan-400">Anything</span> <br />
            <span className="text-cyan-200">Together</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-xl font-[Poppins]">
            Find the perfect partner for your next project, workout, learning
            journey, or shared living. HomieFinder connects you with people who
            share your goals and passions.
          </p>
          <button
            onClick={() => setShowSignup(true)}
            className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-10 py-4 rounded-xl text-xl font-bold shadow-lg transition font-[Poppins]"
          >
            Get Started
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <Landing3D/>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 mb-4 text-cyan-300 text-sm text-center font-[Poppins]">
        &copy; {new Date().getFullYear()} HomieFinder. All rights reserved.
      </footer>

      {/* Modals */}
      {showSignup && (
        <Modal onClose={() => setShowSignup(false)}>
          <SignupForm
            onClose={() => setShowSignup(false)}
            switchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        </Modal>
      )}

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <LoginForm
            onClose={() => setShowLogin(false)}
            switchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          />
        </Modal>
      )}
    </main>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#131a3a] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#1a237e] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

function GoogleLoginButton() {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0a0f2c] font-bold py-3 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-500 transition text-lg border border-cyan-300/30 mb-4 w-full"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.242 3.648-5.617 3.648-3.383 0-6.148-2.805-6.148-6.273s2.765-6.273 6.148-6.273c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.664-1.547-3.828-2.5-6.688-2.5-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.648-.07-1.141-.156-1.457z"
          fill="#fff"
        />
      </svg>
      Continue with Google
    </button>
  );
}

function SignupForm({
  onClose,
  switchToLogin,
}: {
  onClose: () => void;
  switchToLogin: () => void;
}) {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Sign Up</h2>
      <p className="text-gray-400 mb-8 text-center">
        Create your account to get started
      </p>
      <GoogleLoginButton />
      <p className="text-gray-400 text-sm text-center mt-4">
        Already have an account?{" "}
        <button className="text-cyan-400" onClick={switchToLogin}>
          Log in
        </button>
      </p>
    </>
  );
}

function LoginForm({
  onClose,
  switchToSignup,
}: {
  onClose: () => void;
  switchToSignup: () => void;
}) {
  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Login</h2>
      <p className="text-gray-400 mb-8 text-center">
        Access your account to continue
      </p>
      <GoogleLoginButton />
      <p className="text-gray-400 text-sm text-center mt-4">
        Don’t have an account?{" "}
        <button className="text-cyan-400" onClick={switchToSignup}>
          Sign up
        </button>
      </p>
    </>
  );
}
