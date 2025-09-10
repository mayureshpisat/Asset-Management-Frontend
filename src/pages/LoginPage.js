import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleGoogleLogin = () => {
  const clientId = "480700580712-qk4nhh316f5n5b9jfos5n0nldn4gn4i7.apps.googleusercontent.com";
  const redirectUri = "http://localhost:3000/auth/callback"; // must match Google Console
  const scope = "openid email profile";
  const responseType = "id_token";

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&nonce=${crypto.randomUUID()}`;

  window.location.href = url;


  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (!result.success) {
        setError(result.error);
      }
      // If successful, App.js will automatically redirect to home
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login to Asset Management
              </h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    maxLength={30}
                    required
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
  <label htmlFor="password" className="form-label fw-semibold">
    <i className="bi bi-lock me-1"></i>
    Password
  </label>
  
  <div className="input-group">
    <input
      type={showConfirmPassword ? "text" : "password"}
      className="form-control"
      id="password"
      name="password"
      maxLength={32}
      value={formData.password}
      onChange={handleInputChange}
      required
      placeholder="Enter your password"
      autoComplete="current-password"
      disabled={loading}
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      disabled={loading}
      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
    >
      <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
    </button>
  </div>
</div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                  {/* Google Login Button */}
  <button
    type="button"
    className="btn btn-outline-danger"
    onClick={handleGoogleLogin}
  >
    <i className="bi bi-google me-2"></i>
    Login with Google
  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center bg-light">
              <p className="mb-0">
                Don't have an account? 
                <Link to="/register" className="text-primary text-decoration-none ms-1">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;