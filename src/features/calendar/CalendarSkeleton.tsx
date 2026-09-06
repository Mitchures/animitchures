import './CalendarSkeleton.css';

import Skeleton from 'components/Skeleton';
import { CalendarView } from './types';

/** Stands in while a window of the schedule loads, shaped to the active view. */
function CalendarSkeleton({ view }: { view: CalendarView }) {
  if (view === 'agenda') {
    return (
      <div className="calendarSkeleton__agenda">
        {Array.from({ length: 3 }, (_, section) => (
          <div key={section}>
            <Skeleton width="200px" height="18px" />
            <div className="calendarSkeleton__agendaList">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} height="52px" radius="8px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cells = view === 'month' ? 35 : 7;
  return (
    <div className={`calendarSkeleton__grid calendarSkeleton__grid--${view}`}>
      {Array.from({ length: cells }, (_, index) => (
        <Skeleton
          key={index}
          height={view === 'month' ? '112px' : '62vh'}
          radius="9px"
          className="calendarSkeleton__cell"
        />
      ))}
    </div>
  );
}

export default CalendarSkeleton;
