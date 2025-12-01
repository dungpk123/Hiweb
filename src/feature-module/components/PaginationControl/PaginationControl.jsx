import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const PaginationControl = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    const uniquePagesTemp = Array.from(
      new Set(pages.filter((p) => p !== "..."))
    );

    if (currentPage < totalPages - 2) {
      if (
        uniquePagesTemp.length > 0 &&
        uniquePagesTemp[uniquePagesTemp.length - 1] < totalPages - 1
      ) {
        pages.push("...");
      }
    }

    if (totalPages > 1 && uniquePagesTemp.indexOf(totalPages) === -1) {
      pages.push(totalPages);
    }
  }

  const uniquePages = Array.from(new Set(pages));

  return (
    <div
      className="dataTables_paginate paging_simple_numbers"
      id="DataTables_Table_0_paginate"
    >
      <ul className="pagination">
        <li
          className={`paginate_button page-item previous ${
            currentPage === 1 ? "disabled" : ""
          }`}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <Link to="#" className="page-link">
            <FontAwesomeIcon icon={faAngleLeft} />
          </Link>
        </li>

        {uniquePages.map((page, index) => {
          if (page === "...") {
            return (
              <li key={index} className="paginate_button page-item disabled">
                <Link to="#" className="page-link">
                  ...
                </Link>
              </li>
            );
          }
          return (
            <li
              key={index}
              className={`paginate_button page-item ${
                page === currentPage ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              <Link to="#" className="page-link">
                {page}
              </Link>
            </li>
          );
        })}

        <li
          className={`paginate_button page-item next ${
            currentPage === totalPages ? "disabled" : ""
          }`}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <Link to="#" className="page-link">
            <FontAwesomeIcon icon={faAngleRight} />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default PaginationControl;
