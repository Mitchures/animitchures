import classnames from 'classnames';

import './Pagination.css';

import { usePagination, DOTS } from 'utils/hooks';

function Pagination({
  onPageChange,
  total,
  siblingCount = 1,
  currentPage,
  perPage,
  lastPage,
}: any) {
  const paginationRange: any = usePagination({
    currentPage,
    total,
    siblingCount,
    perPage,
    lastPage,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  return (
    <div className="pagination">
      <ul className={classnames('pagination__container')}>
        <li
          className={classnames('pagination__item', {
            disabled: currentPage === 1,
          })}
          onClick={onPrevious}
        >
          <div className="arrow left" />
        </li>
        {paginationRange.map((pageNumber: number | string) => {
          if (pageNumber === DOTS) {
            return <li className="pagination__item dots">&#8230;</li>;
          }

          return (
            <li
              className={classnames('pagination__item', {
                selected: pageNumber === currentPage,
              })}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </li>
          );
        })}
        <li
          className={classnames('pagination__item', {
            disabled: currentPage === lastPage,
          })}
          onClick={onNext}
        >
          <div className="arrow right" />
        </li>
      </ul>
    </div>
  );
}

export default Pagination;
