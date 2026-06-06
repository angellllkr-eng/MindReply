import assert from "node:assert/strict";
import {
  analyticsEnvKeys,
  getSolutionLandingAudience,
  solutionLandingEventName,
  solutionLandingPaths,
} from "../lib/marketing-events";
import { productionRequirements } from "../lib/production-requirements";
import { solutionPages } from "../lib/seo";

const expectedPaths = solutionPages.map((page) => `/solutions/${page.slug}`);
assert.deepEqual(solutionLandingPaths, expectedPaths);
assert.equal(solutionLandingPaths.length, 4);

for (const page of solutionPages) {
  assert.equal(getSolutionLandingAudience(`/solutions/${page.slug}`), page.slug);
  assert.equal(getSolutionLandingAudience(`/solutions/${page.slug}/`), page.slug);
}

const nonSolutionPaths = [
  "/",
  "/agent",
  "/tools",
  "/memberships",
  "/solutions",
  "/solutions/not-real",
  "/professionals",
];

for (const path of nonSolutionPaths) {
  assert.equal(getSolutionLandingAudience(path), null);
}

const analyticsRequirement = productionRequirements.find((item) => item.healthCheck === "analytics");
assert.ok(analyticsRequirement);
assert.deepEqual(analyticsRequirement.keys, [...analyticsEnvKeys]);
assert.equal(solutionLandingEventName, "solution_landing_conversion_intent");

console.log("Marketing event checks passed.");

export {};
