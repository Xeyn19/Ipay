const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const companyEmailError = "Please use a valid company email address.";
const validEmailError = "Enter a valid email address.";
const ABSTRACT_EMAIL_VALIDATION_URL =
  "https://emailvalidation.abstractapi.com/v1/";
const ABSTRACT_EMAIL_VALIDATION_TIMEOUT_MS = 3000;

type AbstractValidationFlag = {
  text?: string | null;
  value?: boolean | null;
};

type AbstractEmailValidationResponse = {
  deliverability?: "DELIVERABLE" | "UNDELIVERABLE" | "UNKNOWN" | null;
  is_disposable_email?: AbstractValidationFlag | null;
  is_free_email?: AbstractValidationFlag | null;
  is_valid_format?: AbstractValidationFlag | null;
};

function isProposalEmailValidationEnabled() {
  return process.env.PROPOSAL_EMAIL_VALIDATION_ENABLED !== "false";
}

function getAbstractEmailApiKey() {
  return process.env.ABSTRACT_EMAIL_API_KEY?.trim() ?? "";
}

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

function getFallbackRestrictedDomains() {
  return parseDomainList(
    process.env.PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS
  );
}

function getBlockedDomains() {
  return parseDomainList(process.env.PROPOSAL_BLOCKED_EMAIL_DOMAINS);
}

function getFlagValue(flag: AbstractValidationFlag | null | undefined) {
  return flag?.value === true;
}

async function getAbstractEmailValidation(
  email: string
): Promise<AbstractEmailValidationResponse | null> {
  if (!isProposalEmailValidationEnabled()) {
    return null;
  }

  const apiKey = getAbstractEmailApiKey();

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    auto_correct: "false",
    email,
  });

  try {
    const response = await fetch(
      `${ABSTRACT_EMAIL_VALIDATION_URL}?${params.toString()}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(ABSTRACT_EMAIL_VALIDATION_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      console.warn("Abstract email validation request failed.", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    return (await response.json()) as AbstractEmailValidationResponse;
  } catch (error) {
    console.warn("Abstract email validation request failed.", error);
    return null;
  }
}

export async function getProposalEmailError(email: string) {
  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return validEmailError;
  }

  const domain = getEmailDomain(email);

  if (
    getBlockedDomains().some((blockedDomain) =>
      domainMatches(domain, blockedDomain)
    )
  ) {
    return companyEmailError;
  }

  const abstractResult = await getAbstractEmailValidation(email);

  if (!abstractResult) {
    if (
      getFallbackRestrictedDomains().some((blockedDomain) =>
        domainMatches(domain, blockedDomain)
      )
    ) {
      return companyEmailError;
    }

    return null;
  }

  if (
    abstractResult.is_valid_format?.value === false ||
    abstractResult.deliverability === "UNDELIVERABLE"
  ) {
    return validEmailError;
  }

  if (
    getFlagValue(abstractResult.is_disposable_email) ||
    getFlagValue(abstractResult.is_free_email)
  ) {
    return companyEmailError;
  }

  return null;
}
