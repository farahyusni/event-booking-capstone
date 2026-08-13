export default function DataControls({ pageInfo, loading, onRefresh, onPageSizeChange, onSortChange }) {
  return (
    <section className="card">
      <div className="section-heading">
        <p className="eyebrow">Listing controls</p>
        <h2>Sort and page size</h2>
      </div>

      <div className="action-row">
        <label>
          Page size
          <select value={pageInfo.size} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </label>

        <label>
          Sort by
          <select value={pageInfo.sortBy} onChange={(event) => onSortChange(event.target.value, pageInfo.direction)}>
            <option value="eventDate">Event date</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
        </label>

        <label>
          Direction
          <select value={pageInfo.direction} onChange={(event) => onSortChange(pageInfo.sortBy, event.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      <div className="action-row">
        <button className="button-link" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </section>
  );
}
