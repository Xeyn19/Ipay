import assert from "node:assert/strict";
import test from "node:test";

import { buildLeadAutoReplyMessage } from "./lead-auto-reply-message.mjs";

test("builds a no-reply auto-reply with submitted request details", () => {
  const { html, text } = buildLeadAutoReplyMessage({
    company: "Company Name",
    contact_number: "+63 900 000 0000",
    email: "you@company.com",
    id: 1,
    message: "We need help accepting online payments.",
    name: "Juan dela Cruz",
  });

  assert.match(text, /Hi Juan dela Cruz,/);
  assert.match(
    text,
    /We have received your request and our team is reviewing the details\./
  );
  assert.match(
    text,
    /We will follow up with you soon regarding the next steps\./
  );
  assert.match(text, /Request details:/);
  assert.match(text, /Full Name: Juan dela Cruz/);
  assert.match(text, /Company: Company Name/);
  assert.match(text, /Email: you@company\.com/);
  assert.match(text, /Contact Number: \+63 900 000 0000/);
  assert.match(text, /Message:\nWe need help accepting online payments\./);
  assert.match(text, /Regards,\niPay Team/);

  assert.match(html, /background:#f6f7f9/);
  assert.match(html, /background:#f17a1e/);
  assert.match(html, /Request received/);
  assert.match(html, /Request details/);
  assert.match(html, /src="cid:ipay-logo"/);
  assert.match(html, /background:#ffffff/);
  assert.doesNotMatch(html, /background:#08111d/);
  assert.ok(
    html.indexOf("Regards,<br />iPay Team") <
      html.indexOf("cid:ipay-logo")
  );

  assert.doesNotMatch(text, /request for Company Name/);
  assert.doesNotMatch(text, /reply to this email/i);
  assert.doesNotMatch(html, /reply to this email/i);
});

test("omits an empty message field from request details", () => {
  const { text } = buildLeadAutoReplyMessage({
    company: "Company Name",
    contact_number: "+63 900 000 0000",
    email: "you@company.com",
    id: 1,
    message: "   ",
    name: "Juan dela Cruz",
  });

  assert.doesNotMatch(text, /Message:/);
  assert.match(text, /Regards,\niPay Team/);
});
