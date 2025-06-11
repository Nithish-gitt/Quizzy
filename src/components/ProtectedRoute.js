import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/check-auth', {
          withCredentials: true, // 🔐 Sends session cookie
        });
        if (res.data.authenticated) {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return <p>Loading...</p>;

  return auth ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
