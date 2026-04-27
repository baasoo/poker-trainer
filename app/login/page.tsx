"use client";

import { useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header block */}
        <div className="login-header">
          <h1 className="login-title">♠ Poker Trainer ♥</h1>
          <p className="login-subtitle">Master Texas Hold'em Hand Probabilities</p>
        </div>

        {/* Form area */}
        <div className="login-form-area">
          {/* Tab switcher */}
          <div className="tab-switcher login-tabs">
            <button
              onClick={() => setMode("login")}
              className={mode === "login" ? "active" : ""}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={mode === "signup" ? "active" : ""}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <AuthForm mode={mode} />

          {/* Divider */}
          <div className="divider-with-label">
            <span className="divider-with-label-text">Or continue with</span>
          </div>

          {/* Google button */}
          <GoogleSignInButton />
        </div>

        {/* Footer */}
        <div className="login-footer">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="login-footer-link"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

