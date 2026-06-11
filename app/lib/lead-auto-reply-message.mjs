function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTrimmedValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getGreeting(name) {
  const trimmedName = getTrimmedValue(name);

  return trimmedName ? `Hi ${trimmedName},` : "Hi,";
}

function getRequestDetails(lead) {
  return [
    ["Full Name", getTrimmedValue(lead.name)],
    ["Company", getTrimmedValue(lead.company)],
    ["Email", getTrimmedValue(lead.email)],
    ["Contact Number", getTrimmedValue(lead.contact_number)],
    ["Message", getTrimmedValue(lead.message)],
  ].filter(([, value]) => Boolean(value));
}

function formatTextDetails(details) {
  return details
    .map(([label, value]) =>
      label === "Message" ? `${label}:\n${value}` : `${label}: ${value}`
    )
    .join("\n");
}

function formatHtmlDetails(details) {
  return details
    .map(([label, value]) => {
      const escapedLabel = escapeHtml(label);
      const escapedValue = escapeHtml(value).replaceAll("\n", "<br />");

      if (label === "Message") {
        return `<p style="margin:0;font-size:14px;line-height:1.55;color:#374151;"><strong>${escapedLabel}:</strong><br />${escapedValue}</p>`;
      }

      return `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#374151;"><strong>${escapedLabel}:</strong> ${escapedValue}</p>`;
    })
    .join("");
}

export function buildLeadAutoReplyMessage(lead) {
  const greeting = getGreeting(lead.name);
  const details = getRequestDetails(lead);

  const textParts = [
    greeting,
    "",
    "Thank you for reaching out to iPay.",
    "",
    "We have received your request and our team is reviewing the details.",
    "",
    "We will follow up with you soon regarding the next steps.",
  ];

  if (details.length > 0) {
    textParts.push("", "Request details:", formatTextDetails(details));
  }

  textParts.push("", "Regards,", "iPay Team");

  const htmlParts = [
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827;">',
    '<tr><td align="center" style="padding:28px 16px;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">',
    '<tr><td style="height:5px;background:#f17a1e;line-height:5px;font-size:0;">&nbsp;</td></tr>',
    '<tr><td style="padding:28px 30px 24px;">',
    '<p style="margin:0 0 8px;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.08em;color:#f17a1e;font-weight:700;">Request received</p>',
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#111827;">${escapeHtml(
      greeting
    )}</p>`,
    '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#111827;">Thank you for reaching out to iPay.</p>',
    '<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#111827;">We have received your request and our team is reviewing the details.</p>',
    '<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#111827;">We will follow up with you soon regarding the next steps.</p>',
  ];

  if (details.length > 0) {
    htmlParts.push(
      `<div style="border:1px solid #e5e7eb;border-radius:8px;background:#fbfbfc;padding:16px 18px;margin:0 0 24px;"><p style="margin:0 0 12px;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.08em;color:#f17a1e;font-weight:700;">Request details</p>${formatHtmlDetails(
        details
      )}</div>`
    );
  }

  htmlParts.push(
    '<p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#111827;">Regards,<br />iPay Team</p>',
    '<div style="display:inline-block;margin-top:8px;padding:0;background:#ffffff;">',
    '<img src="cid:ipay-logo" alt="iPay logo" width="104" style="display:block;width:104px;max-width:104px;height:auto;border:0;outline:none;text-decoration:none;" />',
    "</div>",
    "</td></tr>",
    '<tr><td style="padding:16px 30px;background:#fbfbfc;border-top:1px solid #e5e7eb;">',
    '<p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">This is an automated confirmation from iPay.</p>',
    "</td></tr>",
    "</table>",
    "</td></tr>",
    "</table>"
  );

  return {
    html: htmlParts.join(""),
    text: textParts.join("\n"),
  };
}
