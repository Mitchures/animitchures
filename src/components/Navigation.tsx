import { NavLink, Link } from 'react-router-dom';
import './Navigation.css';

import { NavSection } from './nav-items';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  sections: NavSection[];
  onLogout: () => void;
}

function Navigation({ sections, onLogout }: Props) {
  return (
    <div className="navigation">
      <Link to="/" className="navigation__logo">
        <img src={Logo} alt="animitchures" />
        <span className="navigation__wordmark">
          animitchures<span></span>
        </span>
      </Link>
      <div className="navigation__container">
        {sections.map((section) => (
          <div key={section.id}>
            <h5>{section.heading}</h5>
            <ul>
              {section.items.map(({ id, label, to, Icon, end, isLogout }) => (
                <li key={id}>
                  {/* aria-label is required, not decoration: collapsed to a rail
                      the visible label is hidden, leaving only an icon. */}
                  {isLogout ? (
                    <Link to={to} className="logout" aria-label={label} onClick={onLogout}>
                      <div className="navigation__icon">
                        <Icon />
                      </div>
                      <span>{label}</span>
                    </Link>
                  ) : (
                    <NavLink to={to} end={end} aria-label={label}>
                      <div className="navigation__icon">
                        <Icon />
                      </div>
                      <span>{label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Navigation;
