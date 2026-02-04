const disposableDomains = [
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "trashmail.com",
  "temp-mail.org",
  "yopmail.com",
  "getnada.com",
  "fakeinbox.com",
];

function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return true; // block invalid emails

  const domain = email.split("@")[1].toLowerCase();

  // Check direct domain
  if (disposableDomains.includes(domain)) return true;

  // Check subdomains like abc.mailinator.com
  return disposableDomains.some((d) => domain.endsWith(d));
}

module.exports = isDisposableEmail;
