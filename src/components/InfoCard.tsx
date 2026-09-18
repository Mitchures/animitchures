import { ReactNode } from 'react';
import { Close } from '@mui/icons-material';

import './InfoCard.css';

import IconButton from 'components/IconButton';

interface Props {
  title: string;
  value: ReactNode;
  unit?: string;
  /** 0..1 */
  progress?: number;
  caption?: string;
  poster?: string;
  onDismiss?: () => void;
}

/** Grey card: title, big value + unit, lime-dot progress line, caption, optional poster. */
function InfoCard({ title, value, unit, progress, caption, poster, onDismiss }: Props) {
  return (
    <div className={`infoCard${poster ? ' infoCard--poster' : ''}`}>
      <h3 className="infoCard__title">{title}</h3>
      {onDismiss && (
        <span className="infoCard__dismiss">
          <IconButton label="Dismiss" onClick={onDismiss}>
            <Close />
          </IconButton>
        </span>
      )}
      <div className="infoCard__value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {progress !== undefined && (
        <div
          className="infoCard__progress"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="infoCard__dot" style={{ left: `calc(${progress * 100}% - 8px)` }} />
          <span className="infoCard__line" />
          <span className="infoCard__end" />
        </div>
      )}
      {caption && <p className="infoCard__caption">{caption}</p>}
      {poster && <img className="infoCard__poster" src={poster} alt="" />}
    </div>
  );
}

export default InfoCard;
