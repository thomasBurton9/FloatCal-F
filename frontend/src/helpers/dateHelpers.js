// Formats date object into api receivable YYYY-MM-DD
export function formatDate(date) {
  if (!date) {
    console.error("No date provided");
    return formatDate(new Date());
  }
  if (typeof date === "string") {
    date = new Date(date);
  }
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0 indexes i.e. jan = 0
  const day = String(date.getDate()).padStart(2, "0");

  const finalDate = `${year}-${month}-${day}`;
  return finalDate;
}
// HH:MM:SS -> Date object
export function timeStringToDate(time) {
  const hours = time.slice(0, 2);
  const minutes = time.slice(3, 5);

  let date = new Date();
  date.setHours(hours, minutes);

  return date;
}

// Date object -> Formatted time HH:MM
export function extractTime(inputDate) {
  const date = new Date(inputDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function addMinutesToDateTime(dateString, timeString, minutes) {
  const newDateTime = new Date(`${dateString}T${timeString}`);
  const duration = parseInt(minutes);

  newDateTime.setMinutes(newDateTime.getMinutes() + duration); // Automatically rolls the hour over in case it does go over

  const newHours = String(newDateTime.getHours()).padStart(2, "0");
  const newMinutes = String(newDateTime.getMinutes()).padStart(2, "0"); // 'minutes' has already been declared??
  return `${formatDate(newDateTime)}T${newHours}:${newMinutes}:00`;
}
