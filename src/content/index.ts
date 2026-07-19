import { landmark as languages_javascript_typescript } from './languages/javascript-typescript.ts';
import { landmark as languages_python } from './languages/python.ts';
import { landmark as languages_html_css } from './languages/html-css.ts';
import { landmark as languages_types_and_contracts } from './languages/types-and-contracts.ts';
import { landmark as languages_runtimes_and_packages } from './languages/runtimes-and-packages.ts';
import { landmark as languages_reading_generated_code } from './languages/reading-generated-code.ts';
import { landmark as databases_sql } from './databases/sql.ts';
import { landmark as databases_nosql_document } from './databases/nosql-document.ts';
import { landmark as databases_vector } from './databases/vector.ts';
import { landmark as databases_graph } from './databases/graph.ts';
import { landmark as databases_orm_vs_raw_sql } from './databases/orm-vs-raw-sql.ts';
import { landmark as databases_hosted_vs_self_hosted_databases } from './databases/hosted-vs-self-hosted-databases.ts';
import { landmark as infra_serverless_functions } from './infra/serverless-functions.ts';
import { landmark as infra_vps_single_server } from './infra/vps-single-server.ts';
import { landmark as infra_containers } from './infra/containers.ts';
import { landmark as infra_edge_compute } from './infra/edge-compute.ts';
import { landmark as infra_static_cdn } from './infra/static-cdn.ts';
import { landmark as infra_managed_platforms } from './infra/managed-platforms.ts';
import { landmark as ai_types_model_call_vs_agent } from './ai-types/model-call-vs-agent.ts';
import { landmark as ai_types_retrieval_augmented_generation } from './ai-types/retrieval-augmented-generation.ts';
import { landmark as ai_types_tool_use } from './ai-types/tool-use.ts';
import { landmark as ai_types_workflows_vs_agents } from './ai-types/workflows-vs-agents.ts';
import { landmark as ai_types_ai_evals } from './ai-types/ai-evals.ts';
import { landmark as ai_types_model_selection_routing } from './ai-types/model-selection-routing.ts';
import { landmark as pm_tools_issues_as_specs } from './pm-tools/issues-as-specs.ts';
import { landmark as pm_tools_prd_lite } from './pm-tools/prd-lite.ts';
import { landmark as pm_tools_vertical_slices } from './pm-tools/vertical-slices.ts';
import { landmark as pm_tools_dependencies_and_work_graphs } from './pm-tools/dependencies-and-work-graphs.ts';
import { landmark as pm_tools_decision_logs } from './pm-tools/decision-logs.ts';
import { landmark as pm_tools_backlog_vs_now } from './pm-tools/backlog-vs-now.ts';
import { landmark as git_commits_as_checkpoints } from './git/commits-as-checkpoints.ts';
import { landmark as git_branches_as_isolation } from './git/branches-as-isolation.ts';
import { landmark as git_pull_requests_and_review } from './git/pull-requests-and-review.ts';
import { landmark as git_merge_conflicts } from './git/merge-conflicts.ts';
import { landmark as git_working_tree_hygiene } from './git/working-tree-hygiene.ts';
import { landmark as git_revert_and_recovery } from './git/revert-and-recovery.ts';
import { landmark as security_secrets_and_environment } from './security/secrets-and-environment.ts';
import { landmark as security_authentication_vs_authorization } from './security/authentication-vs-authorization.ts';
import { landmark as security_trust_boundaries } from './security/trust-boundaries.ts';
import { landmark as security_input_validation_and_injection } from './security/input-validation-and-injection.ts';
import { landmark as security_dependency_supply_chain } from './security/dependency-supply-chain.ts';
import { landmark as security_least_privilege_blast_radius } from './security/least-privilege-blast-radius.ts';
import { landmark as design_design_tokens } from './design/design-tokens.ts';
import { landmark as design_component_libraries } from './design/component-libraries.ts';
import { landmark as design_layout_and_spacing_rhythm } from './design/layout-and-spacing-rhythm.ts';
import { landmark as design_typography_and_hierarchy } from './design/typography-and-hierarchy.ts';
import { landmark as design_accessibility_floor } from './design/accessibility-floor.ts';
import { landmark as design_consistency_vs_novelty } from './design/consistency-vs-novelty.ts';

import type { Landmark } from './schema.ts';

export const landmarkRegistry: Record<string, readonly Landmark[]> = {
  "languages": [languages_javascript_typescript, languages_python, languages_html_css, languages_types_and_contracts, languages_runtimes_and_packages, languages_reading_generated_code],
  "databases": [databases_sql, databases_nosql_document, databases_vector, databases_graph, databases_orm_vs_raw_sql, databases_hosted_vs_self_hosted_databases],
  "infra": [infra_serverless_functions, infra_vps_single_server, infra_containers, infra_edge_compute, infra_static_cdn, infra_managed_platforms],
  "ai-types": [ai_types_model_call_vs_agent, ai_types_retrieval_augmented_generation, ai_types_tool_use, ai_types_workflows_vs_agents, ai_types_ai_evals, ai_types_model_selection_routing],
  "pm-tools": [pm_tools_issues_as_specs, pm_tools_prd_lite, pm_tools_vertical_slices, pm_tools_dependencies_and_work_graphs, pm_tools_decision_logs, pm_tools_backlog_vs_now],
  "git": [git_commits_as_checkpoints, git_branches_as_isolation, git_pull_requests_and_review, git_merge_conflicts, git_working_tree_hygiene, git_revert_and_recovery],
  "security": [security_secrets_and_environment, security_authentication_vs_authorization, security_trust_boundaries, security_input_validation_and_injection, security_dependency_supply_chain, security_least_privilege_blast_radius],
  "design": [design_design_tokens, design_component_libraries, design_layout_and_spacing_rhythm, design_typography_and_hierarchy, design_accessibility_floor, design_consistency_vs_novelty],
};
