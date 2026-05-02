type LeadTemplateLead = {
  company?: string | null;
  name?: string | null;
};

export type LeadReplyTemplateDefinition = {
  description: string;
  key: string;
  label: string;
  message: string;
  subject: string;
};

function getLeadGreeting(name: string | null | undefined) {
  return name?.trim() ? `Hi ${name.trim()},` : "Hi,";
}

function getCompanyReference(company: string | null | undefined) {
  return company?.trim() ? company.trim() : "your team";
}

export function getLeadReplyTemplates(
  lead: LeadTemplateLead
): LeadReplyTemplateDefinition[] {
  const greeting = getLeadGreeting(lead.name);
  const companyReference = getCompanyReference(lead.company);

  return [
    {
      description: "Acknowledge the request and set expectations for next steps.",
      key: "acknowledgement",
      label: "Acknowledgement",
      message: [
        greeting,
        "",
        `Thank you for your interest in iPay and for sharing the details for ${companyReference}.`,
        "We have reviewed your request and our team is preparing the next steps for your proposal.",
        "If there are any additional details you would like us to consider, feel free to reply to this email.",
        "",
        "Regards,",
        "iPay Team",
      ].join("\n"),
      subject: "Thank you for your proposal request",
    },
    {
      description: "Request clarifications or missing information before quoting.",
      key: "follow-up-details",
      label: "Need More Details",
      message: [
        greeting,
        "",
        "Thank you for your proposal request.",
        "To prepare the most accurate recommendation, we would appreciate a few additional details regarding your requirements, timeline, and any specific priorities for implementation.",
        "Once we receive that information, we can proceed with the next step of the review.",
        "",
        "Regards,",
        "iPay Team",
      ].join("\n"),
      subject: "Additional details for your proposal request",
    },
    {
      description: "Share documents or files alongside a formal follow-up.",
      key: "proposal-documents",
      label: "Send Documents",
      message: [
        greeting,
        "",
        "Thank you for your patience.",
        "We have attached the requested supporting documents for your review.",
        "Please let us know if you would like us to walk you through any of the details or prepare a tailored discussion for your team.",
        "",
        "Regards,",
        "iPay Team",
      ].join("\n"),
      subject: "Requested documents from iPay",
    },
  ];
}
