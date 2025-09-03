import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

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
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.username, formData.password);
      
      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100">
        <div className="col-md-6 col-lg-4 mx-auto">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                Register for Asset Management
              </h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
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
                    required
                    placeholder="Choose a username"
                    autoComplete="username"
                    disabled={loading}
                    minLength="3"
                    maxLength="30"
                  />
                  <small className="text-muted">Minimum 3 characters/ Maximum 30 characters</small>
                </div>

                <div className="mb-3">
  <label htmlFor="password" className="form-label fw-semibold">
    <i className="bi bi-lock me-1"></i>
    Password
  </label>

  <div className="input-group">
    <input
      type={showPassword ? "text" : "password"}
      className="form-control"
      id="password"
      name="password"
      value={formData.password}
      onChange={handleInputChange}
      required
      placeholder="Choose a password"
      autoComplete="new-password"
      disabled={loading}
      minLength="6"
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowPassword(!showPassword)}
      disabled={loading}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
    </button>
  </div>

  <small className="text-muted">Minimum 6 characters</small>
</div>


                <div className="mb-4">
  <label htmlFor="confirmPassword" className="form-label fw-semibold">
    <i className="bi bi-lock-fill me-1"></i>
    Confirm Password
  </label>

  <div className="input-group">
    <input
      type={showConfirmPassword ? "text" : "password"}
      className="form-control"
      id="confirmPassword"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleInputChange}
      required
      placeholder="Confirm your password"
      autoComplete="new-password"
      disabled={loading}
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      disabled={loading}
      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
    >
      <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
    </button>
  </div>
</div>


                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : success ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Registered Successfully
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Register
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center bg-light">
              <p className="mb-0">
                Already have an account? 
                <Link to="/login" className="text-primary text-decoration-none ms-1">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;