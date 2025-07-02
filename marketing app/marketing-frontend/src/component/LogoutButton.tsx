import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../api/auth';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearTokens();
    navigate('/login'); // redirect after logout
  };

  return <button onClick={handleLogout}>Logout</button>;
}
