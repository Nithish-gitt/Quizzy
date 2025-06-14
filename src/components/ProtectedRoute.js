import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { server } from '../variables/variables';

function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get(`${server}/api/check-auth`, {
        withCredentials: true,
      });

      setAuth(res.data?.authenticated ?? false);
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
