import {Link} from "react-router-dom"
import "../css/pagination.css"
export function Pagination({deck_name, cur_page, total_pages}) {
  let pages = [1, 2, 3, 4, 5];

  if (total_pages < 5) {
    pages = Array.from({length: total_pages}, (_, i) => i + 1)

  } else if (cur_page > 2 && cur_page < total_pages - 2) {
    pages = [cur_page - 2, cur_page - 1, cur_page, cur_page + 1, cur_page + 2]

  } else if (cur_page > total_pages - 2) {
    pages = [total_pages - 4, total_pages - 3, total_pages - 2, total_pages - 1, total_pages]
  }

  return (
    <div className="page-numbers-container">
      {pages.map(page => {
        return (
          <Link to={`/decks/${deck_name}/${page}`}>
            <h1> {page} </h1>
          </Link>
        );
      })}
    </div>
  );
}
