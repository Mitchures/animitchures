import './SignUp.css';
import { auth } from 'utils';
import { Link, useHistory } from 'react-router-dom';
import { useState } from 'react';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const history = useHistory();

  const handleSignUp = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (email && name && password && confirmPassword && password === confirmPassword) {
      auth
        .createUserWithEmailAndPassword(email, password)
        .then(({ user }) => {
          console.log(user);
          return user
            ?.updateProfile({
              displayName: name,
            })
            .then(() => {
              // On success route to home
              history.push('/');
            });
        })
        .catch((error) => alert(error.message));
    } else {
      alert('Please fill out all form fields.');
    }
  };

  return (
    <div className="signUp">
      <div className="signUp__left">
        <div className="signUp__header">
          <Link to="/">
            animitchures<span>.</span>
          </Link>
        </div>
        <div className="signUp__container">
          <div className="signUp__formContainer">
            <h1>Sign Up</h1>
            <form className="signUp__form">
              <div>
                <label htmlFor="signUp-name">Name</label>
                <input
                  type="text"
                  id="signUp-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="signUp-email">Email</label>
                <input
                  type="text"
                  id="signUp-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="signUp-password">Password</label>
                <input
                  type="password"
                  id="signUp-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="signUp-confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="signUp-confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" onClick={handleSignUp}>
                Sign Up
              </button>
            </form>
            <hr />
            <p>
              Already have an account ? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="signUp__right"></div>
    </div>
  );
}

export default SignUp;
