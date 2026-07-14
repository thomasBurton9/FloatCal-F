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
export function timeStringToDate(time) {
  const hours = time.slice(0, 2);
  const minutes = time.slice(3, 5);

  let date = new Date();
  date.setHours(hours, minutes);

  return date;
}
