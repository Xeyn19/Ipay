const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blockedEmailDomains = [
  "pornhub.com",
  "pornhubpremium.com",
  "redtube.com",
  "tube8.com",
  "xhamster.com",
  "xvideos.com",
  "youporn.com",
];

const disposableEmailDomains = [
  "10minutemail.com",
  "guerrillamail.com",
  "maildrop.cc",
  "mailinator.com",
  "sharklasers.com",
  "tempmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
];

function getEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  return atIndex === -1 ? "" : email.slice(atIndex + 1).toLowerCase();
}

function parseDomainList(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean)
    : [];
}

function domainMatches(domain: string, blockedDomain: string) {
  return domain === blockedDomain || domain.endsWith(`.${blockedDomain}`);
}

export function getProposalEmailError(email: string) {
  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return "Enter a valid email address.";
  }

  const domain = getEmailDomain(email);
  const configuredBlockedDomains = parseDomainList(
    process.env.PROPOSAL_BLOCKED_EMAIL_DOMAINS
  );
  const restrictedDomains = [
    ...blockedEmailDomains,
    ...disposableEmailDomains,
    ...configuredBlockedDomains,
  ];

  if (
    restrictedDomains.some((blockedDomain) =>
      domainMatches(domain, blockedDomain)
    )
  ) {
    return "Please use a valid company email address.";
  }

  return null;
}
