import { Link, useNavigate } from 'react-router-dom';

import './SignUp.css';

import { auth } from 'config';
import { useInput } from 'utils/hooks';

import Logo from '../images/animitchures-logo.svg';

function SignUp() {
  const name = useInput('');
  const email = useInput('');
  const password = useInput('');
  const confirmPassword = useInput('');
  const navigate = useNavigate();

  const handleSignUp = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (
      email.value &&
      name.value &&
      password.value &&
      confirmPassword.value &&
      password.value === confirmPassword.value
    ) {
      auth
        .createUserWithEmailAndPassword(email.value, password.value)
        .then(({ user }: any) => {
          console.log(user);
          user
            .updateProfile({
              displayName: name.value,
            })
            .then(() => {
              // On success route to home
              navigate('/');
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
            <img src={Logo} alt="animitchures" />
            animitchures<span></span>
          </Link>
        </div>
        <div className="signUp__container">
          <div className="signUp__formContainer">
            <h1>Sign Up</h1>
            <form className="signUp__form">
              <div>
                <label htmlFor="signUp-name">Name</label>
                <input type="text" id="signUp-name" {...name} />
              </div>
              <div>
                <label htmlFor="signUp-email">Email</label>
                <input type="email" id="signUp-email" {...email} />
              </div>
              <div>
                <label htmlFor="signUp-password">Password</label>
                <input type="password" id="signUp-password" {...password} />
              </div>
              <div>
                <label htmlFor="signUp-confirmPassword">Confirm Password</label>
                <input type="password" id="signUp-confirmPassword" {...confirmPassword} />
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
