const defaultRecipient = "angelllkr@gmail.com";

export function getOpsReportRecipient() {
  return process.env.OPS_REPORT_TO?.trim() || defaultRecipient;
}

export function getOpsReportFrom() {
  return process.env.OPS_REPORT_FROM?.trim() || "";
}

export function isOpsReportingConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CRON_SECRET && getOpsReportRecipient() && getOpsReportFrom());
}
