// Dates are formatted with an explicit month NAME instead of toLocaleString(),
// which follows whatever locale the browser is set to. On an en-US browser
// "2026-10-01" renders as "10/1/2026" — which reads as 10 January to anyone
// using day/month order, and as 1 October to anyone using month/day. A month
// name removes the ambiguity entirely, whatever the viewer's locale.
export function formatDateTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
