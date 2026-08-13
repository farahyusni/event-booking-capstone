// Event.category is free text on the backend (not a fixed enum like a status
// would be), so this is just a consistent pill style — no per-value color
// branching, unlike a typical StatusBadge with AVAILABLE/ASSIGNED/etc colors.
export default function CategoryBadge({ category }) {
  return <span className="category-badge">{category}</span>;
}
