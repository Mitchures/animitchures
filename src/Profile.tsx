import './Profile.css';
import { useStateValue } from 'context';
import { auth } from 'utils';
import { useHistory } from 'react-router-dom';

function Profile() {
  const [{ user }] = useStateValue();
  const history = useHistory();

  const logout = () => {
    auth.signOut().then(() => {
      history.push('/');
    });
  };

  return (
    <div className="profile">
      <h1>{user?.displayName}</h1>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Profile;
