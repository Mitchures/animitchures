import './Watchlist.css';
import { useStateValue } from 'context';
import Card from './components/Card';
import PlaceholderImage from './images/LCAOD.gif';

function Watchlist() {
  const [{ watchlist }] = useStateValue();

  return (
    <div className="watchlist">
      {watchlist.length > 0 ? (
        <div className="watchlist__container">
          {watchlist.map((mediaItem) => (
            <Card key={mediaItem.id} {...mediaItem} />
          ))}
        </div>
      ) : (
        <div className="watchlist__placeholder">
          <img src={PlaceholderImage} alt="Nothing" />
          <h4>Nothing to watch...</h4>
        </div>
      )}
    </div>
  );
}

export default Watchlist;
