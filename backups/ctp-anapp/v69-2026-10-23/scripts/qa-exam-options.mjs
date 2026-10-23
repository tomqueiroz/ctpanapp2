import assert from 'node:assert/strict';
import { getDisplayOptions } from '../apps/client/src/lib/exam-options.ts';

function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, index) =>
    permutations(values.filter((_, i) => i !== index)).map((rest) => [value, ...rest]));
}

const canonical = ['Resposta original 0', 'Resposta original 1', 'Resposta original 2',
  'Resposta original 3', 'Resposta original 4'];
let mappings = 0;
for (const mapping of permutations([0, 1, 2, 3, 4])) {
  const delivery = { options: mapping.map((i) => canonical[i]), option_indices: mapping };
  const displayed = getDisplayOptions(delivery);
  for (let correct = 0; correct < 5; correct++) {
    const selected = displayed.find((option) => option.option === canonical[correct]);
    assert.equal(selected.originalIndex, correct);
    mappings++;
  }
  assert.deepEqual(getDisplayOptions(delivery), displayed, 'Rerenders must not reshuffle');
  assert.deepEqual(delivery.option_indices, mapping, 'Do not mutate the delivery');
}
for (const mapping of [undefined, [], [0, 1, 2, 3, 3], [0, 1, 2, 3, 5], [0, 1, 2, 3, -1], [0, 1, 2, 3, 3.5]]) {
  assert.throws(() => getDisplayOptions({ options: canonical, option_indices: mapping }));
}
assert.throws(() => getDisplayOptions({ options: canonical.slice(1), option_indices: [0, 1, 2, 3, 4] }));
console.log(JSON.stringify({ ok: true, permutations: 120, canonical_answer_mappings: mappings,
  stable_rerenders: 120, invalid_deliveries_rejected: 7 }));
