import { useNavigate } from 'react-router-dom';
import { server } from './variables/variables';
import './Navbar.css';

function Navbar({username}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      const res = await fetch(`${server}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Logged out successfully');
        navigate('/');
      } else {
        alert(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const handleHome =()=>{
    navigate('/test-results', { state: { myParam: username}  });
  }

  return (
    <nav className="navbar">
      <button className="home-button" onClick={handleHome}>
        Home
      </button>
      <h2>User Dashboard</h2>
      
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
