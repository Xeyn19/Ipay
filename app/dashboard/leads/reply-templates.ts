type LeadTemplateLead = {
  company?: string | null;
  name?: string | null;
};

export type LeadReplyTemplateKind = "built-in" | "custom";

export type LeadReplyTemplateDefinition = {
  description: string;
  kind: LeadReplyTemplateKind;
  key: string;
  label: string;
  message: string;
  sourceTemplateKey?: string | null;
  subject: string;
};

export type LeadReplyTemplateRecord = {
  created_at?: string | null;
  id: number;
  label: string;
  message_text: string;
  source_template_key?: string | null;
  subject: string;
};

function getLeadGreeting(name: string | null | undefined) {
  return name?.trim() ? `Hi ${name.trim()},` : "Hi,";
}

function getCompanyReference(company: string | null | undefined) {
  return company?.trim() ? company.trim() : "your team";
}

export function getBuiltInLeadReplyTemplates(
  lead: LeadTemplateLead
): LeadReplyTemplateDefinition[] {
  const greeting = getLeadGreeting(lead.name);
  const companyReference = getCompanyReference(lead.company);

  return [
    {
      description: "Acknowledge the request and set expectations for next steps.",
      key: "builtin:acknowledgement",
      kind: "built-in",
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
      sourceTemplateKey: null,
      subject: "Thank you for your proposal request",
    },
    {
      description: "Request clarifications or missing information before quoting.",
      key: "builtin:follow-up-details",
      kind: "built-in",
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
      sourceTemplateKey: null,
      subject: "Additional details for your proposal request",
    },
    {
      description: "Share documents or files alongside a formal follow-up.",
      key: "builtin:proposal-documents",
      kind: "built-in",
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
      sourceTemplateKey: null,
      subject: "Requested documents from iPay",
    },
  ];
}

function getBuiltInTemplateLabelByKey(
  builtInTemplates: LeadReplyTemplateDefinition[],
  sourceTemplateKey: string | null | undefined
) {
  if (!sourceTemplateKey) {
    return null;
  }

  return (
    builtInTemplates.find((template) => template.key === sourceTemplateKey)?.label ?? null
  );
}

export function mapCustomLeadReplyTemplate(
  record: LeadReplyTemplateRecord,
  builtInTemplates: LeadReplyTemplateDefinition[]
): LeadReplyTemplateDefinition {
  const sourceLabel = getBuiltInTemplateLabelByKey(
    builtInTemplates,
    record.source_template_key
  );

  return {
    description: sourceLabel
      ? `Saved by you from ${sourceLabel}.`
      : "Saved by you for future replies.",
    key: `custom:${record.id}`,
    kind: "custom",
    label: record.label,
    message: record.message_text,
    sourceTemplateKey: record.source_template_key ?? null,
    subject: record.subject,
  };
}

export function getLeadReplyTemplates(
  lead: LeadTemplateLead,
  customTemplates: LeadReplyTemplateRecord[] = []
): LeadReplyTemplateDefinition[] {
  const builtInTemplates = getBuiltInLeadReplyTemplates(lead);
  const mappedCustomTemplates = customTemplates.map((template) =>
    mapCustomLeadReplyTemplate(template, builtInTemplates)
  );

  return [...builtInTemplates, ...mappedCustomTemplates];
}
