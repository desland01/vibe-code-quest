// Keep these defaults in sync with src/server/ai.ts. Plain Node cannot import
// that TypeScript module through the app's @/server alias.
const configuredModels = Object.freeze({
  executor: process.env.AI_MODEL_EXECUTOR || 'openai/gpt-5.6-luna',
  fallback: process.env.AI_MODEL_FALLBACK || 'openai/gpt-5.4-nano',
  advisor: process.env.AI_MODEL_ADVISOR || 'openai/gpt-5.6-sol',
});

function sharedPrefixLength(left, right) {
  let index = 0;
  while (index < left.length && left[index] === right[index]) index += 1;
  return index;
}

function closestIds(id, availableIds) {
  const [provider, ...nameParts] = id.split('/');
  const name = nameParts.join('/');
  return availableIds
    .filter((candidate) => candidate.startsWith(`${provider}/`))
    .sort((left, right) => {
      const leftName = left.slice(provider.length + 1);
      const rightName = right.slice(provider.length + 1);
      const score = sharedPrefixLength(rightName, name) - sharedPrefixLength(leftName, name);
      return score || left.localeCompare(right);
    })
    .slice(0, 3);
}

let payload;
try {
  const response = await fetch('https://ai-gateway.vercel.sh/v1/models');
  if (!response.ok) throw new Error(`Gateway returned HTTP ${response.status}`);
  payload = await response.json();
} catch {
  console.log('skipped: network unavailable');
  process.exit(0);
}

const availableIds = new Set(
  (Array.isArray(payload?.data) ? payload.data : [])
    .map((model) => model?.id)
    .filter((id) => typeof id === 'string')
);

let hasUnknownModel = false;
for (const [role, id] of Object.entries(configuredModels)) {
  const known = availableIds.has(id);
  console.log(`${role}: ${id} ${known ? 'OK' : 'UNKNOWN'}`);
  if (!known) {
    hasUnknownModel = true;
    const hints = closestIds(id, [...availableIds]);
    if (hints.length > 0) console.log(`  closest: ${hints.join(', ')}`);
  }
}

process.exitCode = hasUnknownModel ? 1 : 0;
