// src/pages/AuthCallbackPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleExternalLogin = async () => {
      // Extract the fragment from URL
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const idToken = params.get("id_token");

      if (!idToken) {
        console.error("No ID token found in callback URL");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Send ID token to backend ExternalLogin endpoint
        const response = await fetch("https://localhost:7242/api/Auth/ExternalLogin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error("External login failed");
        }

        const data = await response.json();
        console.log("FROM AUTH CALLBACK")
        console.log(data.token)
        console.log(data.user)

        // Update AuthProvider state and localStorage
        loginWithToken(data.token, data.user);

        // Redirect to home
        navigate("/", { replace: true });
      } catch (error) {
        console.error("External login error:", error);
        navigate("/login", { replace: true });
      }
    };

    handleExternalLogin();
  }, [navigate, loginWithToken]);

  return <p>Signing you in with Google...</p>;
}

export default AuthCallbackPage;
