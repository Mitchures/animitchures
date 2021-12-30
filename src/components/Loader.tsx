import './Loader.css';
import PlaceholderImage from '../images/LCAOD.gif';

function Loader({ placeholderText = 'Loading...' }) {
  return (
    <div className="loader">
      <img src={PlaceholderImage} alt="Loading" />
      <h4>{placeholderText}</h4>
    </div>
  );
}

export default Loader;
