import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const assetsRoot = resolve(root, ".skywork/business-template-assets/crm");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function requireFile(path) {
  assert.ok(existsSync(path), `expected ${path} to exist`);
  return readFileSync(path, "utf8");
}

const catalog = readJson(resolve(assetsRoot, "catalog.json"));
assert.equal(catalog.schemaVersion, 2);
assert.equal(catalog.id, "crm-website-preset-v1");
assert.equal(catalog.projectMode, "standard-self-host-website");
assert.equal(catalog.entryPath, "/");
assert.equal(catalog.agentGuide.templatePath, "AGENTS.crm.md");
assert.equal(catalog.agentGuide.generatedPath, "AGENTS.crm.md");
assert.equal(catalog.runtimeContractPath, "runtime-contract.json");
assert.equal(catalog.sourceRegistrySchemaPath, "source-registry.schema.json");
assert.equal(catalog.auth.defaultMode, "local-admin-v1");
assert.equal(catalog.auth.presetPath, "auth/local-admin-v1");
assert.equal(catalog.auth.contractPath, "auth/local-admin-v1/contract.json");
assert.equal(catalog.auth.overlayRoot, "auth/local-admin-v1/overlay");
assert.equal(catalog.validation.generatedInspectorPath, "scripts/inspect-crm-state.mjs");
assert.ok(catalog.materialization.deletePaths.includes("apps/server/migrations/000_auth.sql"));
assert.ok(catalog.materialization.deletePaths.includes("apps/server/routes/todos.route.ts"));
assert.doesNotMatch(JSON.stringify(catalog), /embedded|__skywork\/crm|business_crm_access/i);

const guide = requireFile(resolve(assetsRoot, catalog.agentGuide.templatePath));
for (const required of [
  "Required Execution Order",
  ".skywork/web-apps.json",
  "source-registry.json",
  "source-registry.schema.json",
  "sourceWebsiteId",
  "crm_",
  "first successfully registered account becomes the administrator",
  "CRM Information Architecture",
  "CRM Functional Requirements",
  "visible primary navigation for its business modules",
  "selected scenario's visual language",
  "those requirements take precedence over the selected scenario reference",
  "record its ID in `.skywork/crm/selection.json`",
  "ui-reference/CrmScenarioReference.tsx",
  "At handoff, report the selected scenario"
]) assert.match(guide, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
assert.doesNotMatch(guide, /schemaFingerprint|bindingFingerprint|validatedSourceHash|sourceHashMatches/);
assert.match(guide, /Do not use schema fingerprints or stale hashes/i);
assert.doesNotMatch(guide, /website skill/i);

const runtime = readJson(resolve(assetsRoot, catalog.runtimeContractPath));
assert.equal(runtime.schemaVersion, 1);
assert.equal(runtime.id, "crm-runtime-contract-v1");
assert.equal(runtime.paths.workspaceManifest, ".skywork/web-apps.json");
assert.equal(runtime.paths.sourceRegistry, "apps/server/crm/source-registry.json");
assert.equal(runtime.paths.sourceRegistrySchema, ".skywork/crm/templates/source-registry.schema.json");
assert.equal(runtime.paths.adapterPattern, "apps/server/crm/adapters/<websiteId>.ts");
assert.equal(runtime.paths.validationResult, ".skywork/crm/validation.json");
assert.deepEqual(runtime.identity.supportStatuses, ["supported", "unsupported"]);
assert.equal(runtime.identity.querySourceIdField, "sourceWebsiteId");
assert.equal(runtime.identity.querySourceNameField, "sourceName");
assert.equal(runtime.ownership.crmTablePrefix, "crm_");
assert.equal(runtime.validation.localOnly, true);
assert.equal(runtime.validation.onlineRuntimeVerificationAllowed, false);
assert.deepEqual(runtime.validation.impactOutcomes, ["unaffected", "compatible-additive", "adapter-change", "required-breaking"]);

const sourceRegistrySchema = readJson(resolve(assetsRoot, catalog.sourceRegistrySchemaPath));
assert.equal(sourceRegistrySchema.$id, "https://skywork.ai/schemas/crm/source-registry-v1.json");
assert.equal(sourceRegistrySchema.additionalProperties, false);
assert.deepEqual(sourceRegistrySchema.required, ["schemaVersion", "sources"]);
assert.equal(sourceRegistrySchema.$defs.source.additionalProperties, false);
assert.equal(sourceRegistrySchema.$defs.entity.additionalProperties, false);
assert.ok(sourceRegistrySchema.examples[0].sources.some((source) => source.supportStatus === "supported"));
assert.ok(sourceRegistrySchema.examples[0].sources.some((source) => source.supportStatus === "unsupported"));

const authRoot = resolve(assetsRoot, catalog.auth.presetPath);
const authContract = readJson(resolve(assetsRoot, catalog.auth.contractPath));
assert.equal(authContract.accessMode, "local-admin-v1");
assert.equal(authContract.bootstrap.publicBetterAuthSignup, "blocked");
assert.equal(authContract.bootstrap.productionSeedAdmin, false);
assert.equal(authContract.administration.lastActiveAdminProtection, true);
assert.equal(authContract.administration.deactivationRevokesSessions, true);
for (const required of [
  "concurrent-bootstrap-single-admin",
  "direct-public-signup-closed",
  "admin-create-user",
  "last-active-admin-protected",
  "deactivation-revokes-sessions"
]) assert.ok(authContract.validation.requiredChecks.includes(required));

const overlayRoot = resolve(authRoot, "overlay");
const requiredOverlayFiles = [
  "apps/server/_core/auth.ts",
  "apps/server/_core/create-app.ts",
  "apps/server/db/crm-auth-schema.ts",
  "apps/server/middlewares/with-session.ts",
  "apps/server/migrations/000_crm_auth.sql",
  "apps/server/migrations/010_crm_support.sql",
  "apps/server/services/crm-auth/bootstrap.ts",
  "apps/server/services/crm-auth/admin-users.ts",
  "apps/server/routes/crm-auth.route.ts",
  "apps/server/routes/crm-users.route.ts",
  "apps/client/src/pages/auth/Index.tsx",
  "apps/client/src/pages/settings/Users.tsx",
  "apps/server/__tests__/crm-local-admin.test.ts",
  "scripts/check-agents-contract.mjs"
];
for (const path of requiredOverlayFiles) requireFile(resolve(overlayRoot, path));
assert.equal(existsSync(resolve(overlayRoot, "AGENTS.crm.md")), false);
const overlayGuideChecker = requireFile(resolve(overlayRoot, "scripts/check-agents-contract.mjs"));
for (const required of [
  "unique `webApps[]` entry whose `type` is `crm`",
  "first successful `/auth` bootstrap registration",
  "record its ID in `.skywork/crm/selection.json`",
  "ui-reference/CrmScenarioReference.tsx",
  "At handoff, report the selected scenario"
]) assert.match(overlayGuideChecker, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

const authSchema = requireFile(resolve(overlayRoot, "apps/server/db/crm-auth-schema.ts"));
for (const table of authContract.tables) assert.match(authSchema, new RegExp(`[\"]${table}[\"]`));
const createApp = requireFile(resolve(overlayRoot, "apps/server/_core/create-app.ts"));
assert.match(createApp, /REGISTRATION_CLOSED/);
assert.match(createApp, /\/api\/auth\/sign-up\/email/);
const bootstrap = requireFile(resolve(overlayRoot, "apps/server/services/crm-auth/bootstrap.ts"));
assert.match(bootstrap, /WHERE singleton_key = 1 AND state = 'open'/);
assert.doesNotMatch(bootstrap, /COUNT\s*\(\s*(?:\*|user)/i);
assert.match(bootstrap, /claim_token/);
const adminUsers = requireFile(resolve(overlayRoot, "apps/server/services/crm-auth/admin-users.ts"));
assert.match(adminUsers, /LAST_ADMIN_REQUIRED/);
assert.match(adminUsers, /DELETE FROM crm_session/);
assert.match(adminUsers, /crm_audit_log/);

for (const name of ["000_crm_auth.sql", "010_crm_support.sql"]) {
  const sql = requireFile(resolve(overlayRoot, "apps/server/migrations", name));
  const objects = [...sql.matchAll(/\b(?:CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?|ALTER\s+TABLE|DROP\s+TABLE(?:\s+IF\s+EXISTS)?)\s+([A-Za-z_][A-Za-z0-9_]*)/gi)].map((match) => match[1]);
  assert.ok(objects.length > 0);
  for (const object of objects) assert.match(object, /^crm_/);
}

assert.deepEqual(catalog.scenarios.map((scenario) => scenario.id), [
  "physical-commerce-v1",
  "digital-commerce-v1",
  "offline-reservation-v1"
]);
const sharedReference = requireFile(resolve(assetsRoot, "ui-reference/CrmScenarioReference.tsx"));
assert.match(sharedReference, /resolveSiteTab/);
assert.match(sharedReference, /Website selector/);

for (const scenario of catalog.scenarios) {
  const scenarioRoot = resolve(assetsRoot, scenario.path);
  assert.equal(scenario.contractPath, "contract.json");
  const contract = readJson(resolve(scenarioRoot, scenario.contractPath));
  const fixture = readJson(resolve(scenarioRoot, "ui-reference/fixture.json"));
  const wrapper = requireFile(resolve(scenarioRoot, "ui-reference/CrmScenarioReference.tsx"));
  assert.equal(contract.templateId, scenario.id);
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.kind, "crm-scenario-reference");
  assert.match(contract.purpose, /never a storage schema or business-rule authority/i);
  assert.ok(contract.referenceEntities.length >= 5);
  assert.ok(Object.keys(contract.operatorCapabilities).length >= 4);
  assert.ok(contract.invariantTopics.length >= 2);
  assert.ok(contract.requiredScenarioChecks.length >= 2);
  assert.equal(fixture.templateId, scenario.id);
  assert.equal(fixture.sites[0]?.id, "all");
  assert.ok(fixture.sites.length >= 4);
  for (const site of fixture.sites) {
    assert.ok(site.id && site.label);
    assert.ok(Array.isArray(site.tabs) && site.tabs.some((tab) => tab.id === "overview"));
    if (site.id !== "all") assert.ok(site.metrics?.length > 0);
  }
  assert.match(wrapper, /CrmScenarioReference/);
}

const contractJsonPaths = [
  "catalog.json",
  catalog.runtimeContractPath,
  catalog.auth.contractPath,
  ...catalog.scenarios.map((scenario) => `${scenario.path}/${scenario.contractPath}`)
];
assert.equal(contractJsonPaths.length, 6);
for (const path of contractJsonPaths) assert.doesNotMatch(requireFile(resolve(assetsRoot, path)), /\"rules\"\s*:/);
assert.equal(existsSync(resolve(assetsRoot, "validation/validation-result-contract.json")), false);

const inspector = requireFile(resolve(assetsRoot, catalog.validation.inspectorPath));
const inspectorTest = requireFile(resolve(assetsRoot, catalog.validation.inspectorTestPath));
assert.match(inspector, /runtime-contract\.json/);
assert.doesNotMatch(inspector, /sourceBindings|source-bindings/);
assert.match(inspector, /sourceRegistry/);
assert.match(inspector, /needs_review/);
assert.doesNotMatch(inspector, /fingerprint/i);
assert.match(inspectorTest, /missingRuntimeContract/);

const lintSource = requireFile(resolve(root, "scripts/lint.mjs"));
assert.match(lintSource, /crm\/validation\/inspect-crm-state\.test\.mjs/);
assert.equal(readdirSync(resolve(assetsRoot, "scenarios")).filter((name) => !name.startsWith(".")).length, 3);

console.log("[check-crm-template-assets] OK");
