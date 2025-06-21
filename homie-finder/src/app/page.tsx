"use client";

import { signInWithGoogle } from "../lib/services/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Landing3D = dynamic(() => import("./components/Landing3D"), { ssr: false });

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
            <Landing3D />
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

function GoogleLoginButton({ onSuccess, onError }: { onSuccess?: () => void; onError?: (err: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      router.push("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError("Google sign-in failed. Please try again.");
      if (onError) onError(err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-[#0a0f2c] font-bold py-3 rounded-lg shadow-lg hover:from-cyan-300 hover:to-blue-500 transition text-lg border border-cyan-300/30 mb-2"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="inline-block">
          <g>
            <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.242 3.648-5.617 3.648-3.383 0-6.148-2.805-6.148-6.273s2.765-6.273 6.148-6.273c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.664-1.547-3.828-2.5-6.688-2.5-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.648-.07-1.141-.156-1.457z" fill="#fff"/>
            <path d="M12.04 22c2.7 0 4.963-.89 6.617-2.42l-3.148-2.57c-.867.617-1.977.984-3.469.984-2.664 0-4.922-1.797-5.727-4.211h-3.242v2.648c1.664 3.273 5.164 5.569 9.969 5.569z" fill="#34A853"/>
            <path d="M6.313 13.994c-.203-.617-.32-1.273-.32-1.994s.117-1.375.32-1.992v-2.648h-3.242c-.664 1.273-1.047 2.719-1.047 4.64s.383 3.367 1.047 4.64l3.242-2.646z" fill="#FBBC05"/>
            <path d="M12.04 7.797c1.477 0 2.484.641 3.055 1.18l2.234-2.18c-1.008-.938-2.305-1.523-5.289-1.523-3.383 0-6.148 2.805-6.148 6.273 0 .719.117 1.375.32 1.992l3.242-2.648c.805-2.414 3.063-4.211 5.586-4.211z" fill="#EA4335"/>
            <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.242 3.648-5.617 3.648-3.383 0-6.148-2.805-6.148-6.273s2.765-6.273 6.148-6.273c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.664-1.547-3.828-2.5-6.688-2.5-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.648-.07-1.141-.156-1.457z" fill="none"/>
          </g>
        </svg>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
      {error && <div className="text-red-400 text-sm text-center">{error}</div>}
    </div>
  );
}

function SignupForm({
  onClose,
  switchToLogin,
}: {
  onClose: () => void;
  switchToLogin: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSuccess("Account created! You can now log in.");
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Sign Up</h2>
      <p className="text-gray-400 mb-8 text-center">
        Create your account to get started
      </p>
      <GoogleLoginButton onSuccess={onClose} />
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-[#232b4d]" />
        <span className="text-gray-400 text-xs">or</span>
        <div className="flex-1 h-px bg-[#232b4d]" />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="text-cyan-400 text-sm text-center">{success}</div>}
        <button
          type="submit"
          className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 rounded-lg transition text-lg shadow"
        >
          Create Account
        </button>
      </form>
      <p className="text-gray-400 mt-6 text-center">
        Already have an account?{" "}
        <button className="text-cyan-300 hover:underline" onClick={switchToLogin}>
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
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setSuccess("Logged in! (Demo only)");
    setForm({ email: "", password: "" });
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-white mb-2 text-center">Login</h2>
      <p className="text-gray-400 mb-8 text-center">Welcome back! Please log in.</p>
      <GoogleLoginButton onSuccess={onClose} />
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-[#232b4d]" />
        <span className="text-gray-400 text-xs">or</span>
        <div className="flex-1 h-px bg-[#232b4d]" />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg bg-[#232b4d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="text-cyan-400 text-sm text-center">{success}</div>}
        <button
          type="submit"
          className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 rounded-lg transition text-lg shadow"
        >
          Log In
        </button>
      </form>
      <p className="text-gray-400 mt-6 text-center">
        Don't have an account?{" "}
        <button className="text-cyan-300 hover:underline" onClick={switchToSignup}>
          Sign up
        </button>
      </p>
    </>
  );
}
