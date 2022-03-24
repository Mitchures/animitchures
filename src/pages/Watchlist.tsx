import { motion } from 'framer-motion';

import './Watchlist.css';

import Card from 'components/Card';
import Loader from 'components/Loader';

import { useStateValue } from 'context';

function Watchlist() {
  const [{ watchlist }] = useStateValue();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="watchlist"
    >
      {watchlist.length > 0 ? (
        <>
          <div className="watchlist__grid">
            {watchlist.map((mediaItem) => (
              <Card key={mediaItem.id} {...mediaItem} />
            ))}
          </div>
        </>
      ) : (
        <Loader placeholderText="Nothing to watch..." />
      )}
    </motion.div>
  );
}

export default Watchlist;
