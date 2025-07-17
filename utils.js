function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().substring(0, 10);
}
function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return formatDate(d);
}
function sumByKey(arr, key) {
  return arr.reduce((sum, obj) => sum + (obj[key] || 0), 0);
}
