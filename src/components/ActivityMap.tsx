import styled from 'styled-components';

export interface IProps {
  activity: any;
  color?: string[];
  squareNumber?: number;
  count: number[];
  squareGap?: string;
  squareSize?: string;
  fontSize?: string;
  tooltipContent?: string;
}

const MONTHS: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEK_DAYS: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAYS_IN_YEAR: number = 365;

const DEFAULT_SQUARE_GAP: string = '4px';

const DEFAULT_SQUARE_SIZE: string = '15px';

const ActivityMap: React.FC<IProps> = ({
  activity,
  color = ['#ebedf0', '#c6e48b', '#40c463', '#30a14e', '#216e39'],
  squareNumber = DAYS_IN_YEAR,
  count,
  squareGap = DEFAULT_SQUARE_GAP,
  squareSize = DEFAULT_SQUARE_SIZE,
  fontSize = '12px',
  tooltipContent,
}: IProps) => {
  // styles (inspired by https://bitsofco.de/github-contribution-graph-css-grid/)
  const Wrapper = styled.div`
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: ${fontSize};
    box-sizing: border-box;
    ul {
      padding-inline-start: 0;
      list-style: none;
    }
  `;
  const Graph = styled.div`
    padding: 20px;
    border: 1px #e1e4e8 solid;
    margin: 20px;
    display: inline-grid;
    grid-template-areas:
      'empty months'
      'days squares';
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  `;
  const SquaresList = styled.ul`
    margin-top: 0;
    margin-block-start: 0;
    grid-area: squares;
    display: grid;
    grid-gap: ${squareGap};
    grid-template-rows: repeat(7, ${squareSize});
    z-index: 1;
    grid-auto-flow: column;
    grid-auto-columns: ${squareSize};
  `;
  const SquareListItem = styled.li`
    border-radius: 3px;
    border: 1px rgba(27, 31, 35, 0.06) solid;
    background-color: ${color[0]};
    &[data-level='1'] {
      background-color: ${color[1]};
    }
    &[data-level='2'] {
      background-color: ${color[2]};
    }
    &[data-level='3'] {
      background-color: ${color[3]};
    }
    &[data-level='4'] {
      background-color: ${color[4]};
    }
    /* tooltip */
    &[data-tooltip] {
      position: relative;
      cursor: pointer;
    }
    &[data-tooltip]:before,
    &[data-tooltip]:after {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }
    &[data-tooltip]:before {
      position: absolute;
      z-index: 999;
      bottom: 150%;
      left: 100%;
      margin-bottom: 5px;
      margin-left: -90px;
      padding: 7px;
      width: 150px;
      border-radius: 3px;
      background-color: #000;
      background-color: hsla(0, 0%, 20%, 0.9);
      color: #fff;
      content: attr(data-tooltip);
      text-align: center;
      font-size: 10px;
      line-height: 1.2;
    }
    &[data-tooltip]:after {
      position: absolute;
      bottom: 150%;
      left: 50%;
      margin-left: -5px;
      width: 0;
      border-top: 5px solid hsla(0, 0%, 20%, 0.9);
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      content: ' ';
      font-size: 0;
      line-height: 0;
      z-index: inherit;
    }
    /* show tooltip content on hover */
    &[data-tooltip]:hover:before,
    &[data-tooltip]:hover:after {
      visibility: visible;
      opacity: 1;
    }
  `;

  return (
    <Wrapper>
      <Graph>
        <SquaresList>
          {activity.map((item: any, i: number) => (
            <SquareListItem
              className="squares"
              data-level={item.level}
              key={i}
              data-tooltip={tooltipContent || `Amount: ${item.amount}`}
            />
          ))}
        </SquaresList>
      </Graph>
    </Wrapper>
  );
};

export default ActivityMap;
