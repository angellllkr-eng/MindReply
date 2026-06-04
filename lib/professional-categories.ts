export const professionalCategoryGroups = {
  psychology: ["Child Psychologist", "Adult Mental Health Support", "Relationship & Communication Coach"],
  legal: ["Legal Advisor", "Compliance Officer"],
  finance: ["Financial Advisor", "Accountant & Tax Advisor", "Risk Analyst"],
  hr: ["HR Leader & Executive PA", "Executive Assistant & Operations", "Event Manager"],
} as const;

export type ProfessionalCategory = keyof typeof professionalCategoryGroups;

export function getProfessionalCategoryRoles(category: string | null | undefined): readonly string[] | null {
  const key = category?.toLowerCase();
  if (!key || !Object.prototype.hasOwnProperty.call(professionalCategoryGroups, key)) return null;
  return professionalCategoryGroups[key as ProfessionalCategory];
}

export function isRoleInProfessionalCategory(role: string, category: string | null | undefined) {
  const roles = getProfessionalCategoryRoles(category);
  return !roles || roles.includes(role);
}

export function professionalCategoryLabel(category: string | null | undefined) {
  const key = category?.toLowerCase();
  if (key === "hr") return "HR & Talent";
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : null;
}
