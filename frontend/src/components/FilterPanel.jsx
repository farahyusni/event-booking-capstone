// Search by keyword (matches event title) and filter by category — both are
// plain text inputs because the backend's category field isn't a fixed enum,
// unlike the instructor's template which used a <select> for a fixed status list.
export default function FilterPanel({ keyword, category, onKeywordChange, onCategoryChange }) {
  return (
    <section className="filter-panel" aria-label="Event filters">
      <label>
        Search events
        <input
          type="search"
          placeholder="Search by title"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </label>

      <label>
        Category
        <input
          type="text"
          placeholder="e.g. Tech, Music"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        />
      </label>
    </section>
  );
}
