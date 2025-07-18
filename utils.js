function formatDate(date) {
  return date.toISOString().split('T')[0];
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
