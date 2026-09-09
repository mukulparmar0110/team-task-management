import { useState } from "react";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "./Register.css";

import { useAuth } from "../context/AuthContext";

import { getErrorMessage } from "../Utils/helpers";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validatePassword = () => {
    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const passwordError = validatePassword();

    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setSubmitting(true);

      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email: formData.email.trim(),
          },
        });
      }, 900);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to create your account. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = [
    {
      label: "At least 6 characters",
      valid: formData.password.length >= 6,
    },
    {
      label: "Passwords match",
      valid:
        Boolean(formData.password) &&
        formData.password ===
          formData.confirmPassword,
    },
  ];

  return (
    <main className="register-page">
      <section className="register-brand-panel">
        <div className="register-brand-content">
          <Link
            to="/"
            className="register-logo"
          >
            <span className="register-logo-mark">
              <Zap
                size={19}
                strokeWidth={2.5}
              />
            </span>

            <span>TaskFlow</span>
          </Link>

          <div className="register-brand-copy">
            <span className="register-eyebrow">
              YOUR TEAM WORKSPACE
            </span>

            <h1>
              Less chasing.
              <span>More doing.</span>
            </h1>

            <p>
              Bring tasks, people, deadlines, and
              conversations together in one simple
              workspace.
            </p>
          </div>

          <div className="register-stat">
            <div className="register-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <strong>One workspace.</strong>

              <span>
                Everyone stays aligned.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="register-form-panel">
        <div className="register-form-wrapper">
          <div className="register-mobile-logo">
            <Link
              to="/"
              className="register-logo"
            >
              <span className="register-logo-mark">
                <Zap
                  size={19}
                  strokeWidth={2.5}
                />
              </span>

              <span>TaskFlow</span>
            </Link>
          </div>

          <div className="register-heading">
            <span className="register-mobile-eyebrow">
              GET STARTED
            </span>

            <h2>Create your account</h2>

            <p>
              Start organizing your team's work
              today.
            </p>
          </div>

          {error && (
            <div
              className="register-error"
              role="alert"
            >
              <span className="register-error-dot" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="register-success"
              role="status"
            >
              <Check size={17} />
              <span>
                Account created! Redirecting to
                sign in...
              </span>
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >
            <div className="register-form-field">
              <label htmlFor="fullName">
                Full name
              </label>

              <div className="register-input-wrapper">
                <UserRound
                  className="register-input-icon"
                  size={18}
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="register-form-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="register-input-wrapper">
                <Mail
                  className="register-input-icon"
                  size={18}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="register-form-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">
                <LockKeyhole
                  className="register-input-icon"
                  size={18}
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={submitting}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="register-form-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="register-input-wrapper">
                <LockKeyhole
                  className="register-input-icon"
                  size={18}
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={submitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="password-checks">
              {passwordChecks.map(
                (check) => (
                  <div
                    key={check.label}
                    className={
                      check.valid
                        ? "password-check valid"
                        : "password-check"
                    }
                  >
                    <span>
                      <Check size={12} />
                    </span>

                    {check.label}
                  </div>
                )
              )}
            </div>

            <button
              type="submit"
              className="register-submit-button"
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <span className="button-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="register-login-link">
            Already have an account?

            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;