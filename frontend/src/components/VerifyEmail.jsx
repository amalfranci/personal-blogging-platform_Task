import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/user/verify/${token}`
        );
        console.log(res);
        setMessage(res.data.msg);
        setIsVerified(true);

        // Redirect to login page after 3 seconds if email is verified
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setMessage(
          error.response?.data?.msg ||
            "There was an error verifying your email. Please try again later."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]); // Add token and navigate as dependencies to useEffect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Email Verification</h1>
        {isVerified ? (
          <div>
            <p className="text-green-600">{message}</p>
            <p className="mt-4">Redirecting to login page...</p>
          </div>
        ) : (
          <p className="text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
