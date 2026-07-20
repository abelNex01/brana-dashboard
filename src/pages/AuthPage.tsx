import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Phone,
  Briefcase,
  Film,
  Camera,
  Clapperboard,
  MonitorPlay,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Slide Data ────────────────────────────────────── */
const slides = [
  {
    title: "Streamline Your Production",
    subtitle:
      "Manage shoots, gear inventory, and your entire crew from a single powerful dashboard.",
    image: "/slide/slide1.webp",
    gradient:
      "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    title: "Track Every Detail",
    subtitle:
      "Schedules, equipment logs, budgets, and invoices — everything at your fingertips in real time.",
    image: "/slide/slide2.webp",
    gradient:
      "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
  {
    title: "Collaborate Seamlessly",
    subtitle:
      "Assign roles, share live updates, and keep your entire production team in perfect sync.",
    image: "/slide/slide3.webp",
    gradient:
      "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
  },
];

const roleOptions = [
  { value: "director", label: "Director", icon: Clapperboard },
  { value: "cameraman", label: "Cameraman", icon: Camera },
  { value: "editor", label: "Editor", icon: MonitorPlay },
  { value: "producer", label: "Producer", icon: Film },
];

/* ─── Component ─────────────────────────────────────── */
export default function AuthPage() {
  const { signUp, signIn, isAtCapacity } = useAuth();

  /* View state */
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  /* Slide carousel */
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActiveSlide((s) => (s + 1) % slides.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  /* Form fields */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 120;
          const MAX_HEIGHT = 120;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 70% quality to yield a tiny (~5-10kb) base64 payload
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setAvatar(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  /* Reset on mode switch */
  const switchMode = (m: "signup" | "signin") => {
    setMode(m);
    setStep(1);
    setError("");
    setSignInError("");
  };

  /* Validation per step */
  const validateStep = useCallback((): boolean => {
    setError("");
    if (step === 1) {
      if (!email.trim()) {
        setError("Email is required.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Enter a valid email address.");
        return false;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      if (!agreedTerms) {
        setError("You must agree to the Terms of Service.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!fullName.trim()) {
        setError("Full name is required.");
        return false;
      }
      if (!role) {
        setError("Please select a role.");
        return false;
      }
      return true;
    }
    return true;
  }, [step, email, password, confirmPassword, agreedTerms, fullName, role]);

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) setStep((s) => s + 1);
  };
  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSignUp = async () => {
    const result = await signUp({ email, password, fullName, phone, role, avatar });
    if (!result.ok) setError(result.error ?? "Sign up failed.");
  };

  const handleSignIn = async () => {
    setSignInError("");
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError("Please enter both email and password.");
      return;
    }
    const result = await signIn(signInEmail, signInPassword);
    if (!result.ok) setSignInError(result.error ?? "Sign in failed.");
  };

  const handleSocialClick = () => {
    setError("Social login coming soon — please use email instead.");
  };

  /* ─── Render ──────────────────────────────────────── */
  return (
    <div className="auth-page">
      {/* ────── LEFT PANEL ────── */}
      <div className="auth-left">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/favicon.svg" alt="Brana Films" className="auth-logo-img" />
          <span className="auth-logo-text">Brana Films</span>
        </div>

        {/* Slides */}
        <div className="auth-slides-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="auth-slide"
            >
              {/* Background image */}
              <img
                src={slides[activeSlide].image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: slides[activeSlide].gradient }}
              />
              {/* Glow */}
              <div
                className="auth-slide-glow"
                style={{ background: slides[activeSlide].gradient }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Text overlay */}
          <div className="auth-slide-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeSlide}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="auth-slide-title">
                  {slides[activeSlide].title}
                </h2>
                <p className="auth-slide-subtitle">
                  {slides[activeSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="auth-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`auth-dot ${i === activeSlide ? "auth-dot--active" : ""}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ────── RIGHT PANEL ────── */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <AnimatePresence mode="wait">
            {mode === "signup" ? (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="auth-form-inner"
              >
                {/* Badge */}
                <div className="auth-badge">
                  <User size={12} />
                  <span>Accounts</span>
                </div>

                <h1 className="auth-form-title">Create Your Account</h1>
                <p className="auth-step-label">
                  Step {step} of {totalSteps}
                </p>

                {/* Step progress bar */}
                <div className="auth-step-bar">
                  <div
                    className="auth-step-bar-fill"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>

                {/* Capacity warning */}
                {isAtCapacity && (
                  <div className="auth-capacity-banner">
                    <AlertTriangle size={18} />
                    <div>
                      <strong>Maximum Capacity Reached</strong>
                      <p>
                        This application has reached its limit of 4 users. No
                        new accounts can be created.
                      </p>
                    </div>
                  </div>
                )}

                {!isAtCapacity && (
                  <AnimatePresence mode="wait">
                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="auth-step-content"
                      >
                        {/* Email */}
                        <div className="auth-field">
                          <label className="auth-label">
                            <Mail size={14} />
                            Email Address
                          </label>
                          <div className="auth-input-wrap">
                            <input
                              id="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="auth-input"
                            />
                          </div>
                        </div>

                        {/* Password row */}
                        <div className="auth-field-row">
                          <div className="auth-field">
                            <label className="auth-label">
                              <Lock size={14} />
                              Password
                            </label>
                            <div className="auth-input-wrap">
                              <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                              />
                              <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="auth-field">
                            <label className="auth-label">
                              Confirm Password
                            </label>
                            <div className="auth-input-wrap">
                              <input
                                id="signup-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                className="auth-input"
                              />
                              <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label="Toggle confirm password visibility"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Terms */}
                        <label className="auth-terms" htmlFor="agree-terms">
                          <input
                            id="agree-terms"
                            type="checkbox"
                            checked={agreedTerms}
                            onChange={(e) => setAgreedTerms(e.target.checked)}
                            className="auth-checkbox"
                          />
                          <span>
                            I agree to the{" "}
                            <button type="button" className="auth-link-inline">
                              Terms of Service
                            </button>{" "}
                            and{" "}
                            <button type="button" className="auth-link-inline">
                              Privacy Policy
                            </button>
                            .
                          </span>
                        </label>

                        <div className="auth-divider">
                          <span>Or</span>
                        </div>

                        {/* Social buttons */}
                        <div className="auth-social-group">
                          <button
                            className="auth-social-btn"
                            onClick={handleSocialClick}
                            type="button"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                          <button
                            className="auth-social-btn"
                            onClick={handleSocialClick}
                            type="button"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <span>Continue with Apple</span>
                          </button>
                          <button
                            className="auth-social-btn"
                            onClick={handleSocialClick}
                            type="button"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <span>Continue with GitHub</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="auth-step-content"
                      >
                        {/* Avatar Image Upload */}
                        <div className="auth-field flex flex-row items-center gap-4 mb-1">
                          <div className="relative group w-16 h-16 rounded-full border border-border/80 bg-muted/20 flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-muted-foreground/60">
                                <Camera size={20} />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer">
                              <span className="text-[9px] text-white font-semibold uppercase tracking-wider text-center px-1">
                                {avatar ? "Change" : "Upload"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-foreground block mb-0.5">
                              Profile Photo
                            </span>
                            <span className="text-[10px] text-muted-foreground block leading-tight">
                              Add a profile picture to customize your dashboard
                              layout.
                            </span>
                          </div>
                        </div>

                        <div className="auth-field">
                          <label className="auth-label">
                            <User size={14} />
                            Full Name
                          </label>
                          <div className="auth-input-wrap">
                            <input
                              id="signup-fullname"
                              type="text"
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div className="auth-field">
                          <label className="auth-label">
                            <Phone size={14} />
                            Phone Number{" "}
                            <span className="auth-optional">(optional)</span>
                          </label>
                          <div className="auth-input-wrap">
                            <input
                              id="signup-phone"
                              type="tel"
                              placeholder="Enter your phone number"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="auth-input"
                            />
                          </div>
                        </div>
                        <div className="auth-field">
                          <label className="auth-label">
                            <Briefcase size={14} />
                            Your Role
                          </label>
                          <div className="auth-role-grid">
                            {roleOptions.map((r) => {
                              const Icon = r.icon;
                              const selected = role === r.value;
                              return (
                                <button
                                  key={r.value}
                                  type="button"
                                  onClick={() => setRole(r.value)}
                                  className={`auth-role-card ${selected ? "auth-role-card--active" : ""}`}
                                >
                                  <Icon size={20} />
                                  <span>{r.label}</span>
                                  {selected && (
                                    <div className="auth-role-check">
                                      <Check size={12} />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 3 ── */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="auth-step-content"
                      >
                        <div className="auth-review">
                          <h3 className="auth-review-heading">
                            Review Your Information
                          </h3>
                          <div className="auth-review-grid">
                            <div className="auth-review-item">
                              <span className="auth-review-label">Email</span>
                              <span className="auth-review-value">{email}</span>
                            </div>
                            <div className="auth-review-item">
                              <span className="auth-review-label">
                                Full Name
                              </span>
                              <span className="auth-review-value">
                                {fullName}
                              </span>
                            </div>
                            {phone && (
                              <div className="auth-review-item">
                                <span className="auth-review-label">Phone</span>
                                <span className="auth-review-value">
                                  {phone}
                                </span>
                              </div>
                            )}
                            <div className="auth-review-item">
                              <span className="auth-review-label">Role</span>
                              <span
                                className="auth-review-value"
                                style={{ textTransform: "capitalize" }}
                              >
                                {role}
                              </span>
                            </div>
                            {avatar && (
                              <div className="auth-review-item">
                                <span className="auth-review-label">
                                  Profile Image
                                </span>
                                <img
                                  src={avatar}
                                  alt="Preview"
                                  className="w-8 h-8 rounded-full object-cover border border-border/60"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-error"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Switch link */}
                <p className="auth-switch">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="auth-switch-link"
                  >
                    Sign In
                  </button>
                </p>

                {/* Navigation */}
                {!isAtCapacity && (
                  <div className="auth-nav-row">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={step === 1}
                      className="auth-nav-btn auth-nav-btn--secondary"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>

                    {step < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="auth-nav-btn auth-nav-btn--primary"
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSignUp}
                        className="auth-nav-btn auth-nav-btn--primary"
                      >
                        Create Account
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* ────── SIGN IN ────── */
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="auth-form-inner"
              >
                <div className="auth-badge">
                  <Lock size={12} />
                  <span>Welcome Back</span>
                </div>

                <h1 className="auth-form-title">Sign In</h1>
                <p className="auth-step-label">
                  Enter your credentials to continue
                </p>

                <div
                  className="auth-step-content"
                  style={{ marginTop: "28px" }}
                >
                  <div className="auth-field">
                    <label className="auth-label">
                      <Mail size={14} />
                      Email Address
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="auth-input"
                        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">
                      <Lock size={14} />
                      Password
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="auth-input"
                        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() =>
                          setShowSignInPassword(!showSignInPassword)
                        }
                        aria-label="Toggle password visibility"
                      >
                        {showSignInPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {signInError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-error"
                  >
                    {signInError}
                  </motion.p>
                )}

                <p className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="auth-switch-link"
                  >
                    Sign Up
                  </button>
                </p>

                <div
                  className="auth-nav-row"
                  style={{ justifyContent: "flex-end" }}
                >
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="auth-nav-btn auth-nav-btn--primary"
                  >
                    Sign In
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
