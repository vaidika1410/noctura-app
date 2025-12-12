
function getDateOfWeekDay(weekday) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayIndex = daysOfWeek.indexOf(weekday);
  if (dayIndex === -1) return null;

  const monday = new Date(today);
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay(); 
  monday.setDate(today.getDate() + diff);

  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayIndex);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
}

module.exports = { getDateOfWeekDay };
