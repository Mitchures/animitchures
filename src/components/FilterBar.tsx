import './FilterBar.css';

/**
 * AniList's genre list is a fixed vocabulary, not user data — it has not changed
 * in years and there is a GenreCollection query that would cost a request to
 * tell us the same eighteen strings.
 */
export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const FORMATS = [
  ['TV', 'TV'],
  ['TV_SHORT', 'TV short'],
  ['MOVIE', 'Film'],
  ['SPECIAL', 'Special'],
  ['OVA', 'OVA'],
  ['ONA', 'ONA'],
] as const;

const STATUSES = [
  ['RELEASING', 'Airing'],
  ['FINISHED', 'Finished'],
  ['NOT_YET_RELEASED', 'Not yet aired'],
] as const;

const SORTS = [
  ['POPULARITY_DESC', 'Most popular'],
  ['SCORE_DESC', 'Highest rated'],
  ['TRENDING_DESC', 'Trending'],
  ['START_DATE_DESC', 'Newest'],
  ['TITLE_ROMAJI', 'A–Z'],
] as const;

const OLDEST_YEAR = 1960;
const YEARS = Array.from(
  { length: new Date().getFullYear() + 1 - OLDEST_YEAR + 1 },
  (_, index) => new Date().getFullYear() + 1 - index,
);

export interface Filters {
  genre: string;
  year: string;
  format: string;
  status: string;
  sort: string;
}

interface Props {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onClear: () => void;
}

/**
 * The filters AniList already accepts.
 *
 * SEARCH_QUERY has declared format, status, season, year, genres, tags, source
 * and several ranges since it was written, and the app passed none of them —
 * this puts the useful subset on screen.
 *
 * Native selects rather than custom dropdowns: they are keyboard and screen
 * reader correct for free, and on a phone they open the platform picker, which
 * is better than anything worth building here.
 */
function FilterBar({ filters, onChange, onClear }: Props) {
  const active = Object.values(filters).filter(Boolean).length;

  const select = (
    name: keyof Filters,
    label: string,
    options: readonly (readonly [string, string])[],
  ) => (
    <label className={`filterBar__field${filters[name] ? ' filterBar__field--on' : ''}`}>
      <span className="filterBar__label">{label}</span>
      <select
        value={filters[name]}
        onChange={(event) => onChange({ [name]: event.target.value })}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="filterBar">
      {select(
        'genre',
        'Any genre',
        GENRES.map((genre) => [genre, genre] as const),
      )}
      {select(
        'year',
        'Any year',
        YEARS.map((year) => [String(year), String(year)] as const),
      )}
      {select('format', 'Any format', FORMATS)}
      {select('status', 'Any status', STATUSES)}
      {select('sort', 'Sort by', SORTS)}

      {active > 0 && (
        <button type="button" className="filterBar__clear" onClick={onClear}>
          Clear {active === 1 ? 'filter' : `all ${active}`}
        </button>
      )}
    </div>
  );
}

export default FilterBar;
