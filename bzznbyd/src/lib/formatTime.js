function toLocalDate(isoStr, timezoneOffset) {
  return new Date(new Date(isoStr).getTime() + timezoneOffset * 1000);
}

export function formatTime(isoStr, timezoneOffset) {
  const local = toLocalDate(isoStr, timezoneOffset);
  let hours = local.getUTCHours();
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
}

export function formatDateTime(isoStr, timezoneOffset) {
  const local = toLocalDate(isoStr, timezoneOffset);
  const month = local.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = local.getUTCDate();
  let hours = local.getUTCHours();
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  return `${month} ${day}. ${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
}
