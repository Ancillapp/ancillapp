export const validateAge = (age?: unknown): age is string => {
  if (!age || typeof age !== 'string') {
    return false;
  }
  const match = age.match(/^([1-9]\d{3})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    return false;
  }

  const [, yearString, monthString, dayString] = match;

  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10);
  const day = parseInt(dayString, 10);

  return (
    year > 1900 &&
    month > 0 &&
    month <= 12 &&
    day > 0 &&
    day <=
      [
        31,
        (!(year % 4) && year % 100) || !(year % 400) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ][month - 1]
  );
};
