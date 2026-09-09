import { useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Login.css";

import { useAuth } from "../context/AuthContext";

import { getErrorMessage } from "../Utils/helpers";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);

      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const destination =
        location.state?.from?.pathname ||
        "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to sign in. Please check your credentials."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-mark">
              <Zap
                size={19}
                strokeWidth={2.5}
              />
            </span>

            <span>TaskFlow</span>
          </Link>

          <div className="auth-brand-copy">
            <span className="auth-eyebrow">
              TEAM TASK MANAGEMENT
            </span>

            <h1>
              Move work forward.
              <span>Together.</span>
            </h1>

            <p>
              Plan tasks, collaborate with your team,
              and keep every deadline under control
              from one focused workspace.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <span className="auth-feature-icon">
                <CheckCircle2 size={18} />
              </span>

              <div>
                <strong>
                  Clear task ownership
                </strong>

                <span>
                  Know exactly who owns every piece
                  of work.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">
                <Users size={18} />
              </span>

              <div>
                <strong>
                  Built for teams
                </strong>

                <span>
                  Keep people, projects, and
                  priorities aligned.
                </span>
              </div>
            </div>

            <div className="auth-feature">
              <span className="auth-feature-icon">
                <ShieldCheck size={18} />
              </span>

              <div>
                <strong>
                  Role-based access
                </strong>

                <span>
                  Everyone gets the right level
                  of access.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-mark">
                <Zap
                  size={19}
                  strokeWidth={2.5}
                />
              </span>

              <span>TaskFlow</span>
            </Link>
          </div>

          <div className="auth-heading">
            <span className="auth-mobile-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your workspace
            </h2>

            <p>
              Enter your credentials to continue
              where you left off.
            </p>
          </div>

          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              <span className="auth-error-dot" />

              <span>{error}</span>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">
                <Mail
                  className="input-icon"
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

            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="password">
                  Password
                </label>
              </div>

              <div className="input-wrapper">
                <LockKeyhole
                  className="input-icon"
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="password-toggle"
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

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to TaskFlow?</span>
          </div>

          <Link
            to="/register"
            className="auth-secondary-button"
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Login;