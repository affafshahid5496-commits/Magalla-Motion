import { LEVELS } from './eligibility.js';

// Booking form rules. Returns an object of { field: message }; empty means valid.
// Only name, email and mobile number are collected, and nothing is sent anywhere.

const NAME_PATTERN = /^[\p{L}][\p{L} .'-]{1,59}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PK_MOBILE_PATTERN = /^(03\d{9}|\+923\d{9})$/;

export function validateBookingForm(form) {
  const errors = {};

  const name = form.fullName.trim();
  if (!name) errors.fullName = 'Enter your full name.';
  else if (!NAME_PATTERN.test(name)) {
    errors.fullName = 'Use 2 to 60 letters. Spaces, apostrophes, dots and hyphens are fine.';
  }

  const email = form.email.trim();
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter an email like name@example.com.';

  const phone = form.phone.replace(/[\s-]/g, '');
  if (!phone) errors.phone = 'Enter your mobile number.';
  else if (!PK_MOBILE_PATTERN.test(phone)) {
    errors.phone = 'Enter a Pakistani mobile number like 0300 1234567 or +92 300 1234567.';
  }

  if (!LEVELS.includes(form.level)) errors.level = 'Choose your experience level.';

  if (!form.agree) errors.agree = 'Please confirm that you understand this is a simulated booking.';

  return errors;
}
