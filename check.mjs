import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { predict } from "./inference.mjs";

const folder = process.argv[2] ?? ".";
const load = async (name) => JSON.parse(await readFile(join(folder, name), "utf8"));
const model = await load("model.json");
const fixtures = await load("fixtures.json");
const examples = await load("examples.json");
assert.ok(model.layers.length >= 2, "Expected hidden and output layers.");
assert.equal(model.numeric.length + model.categorical.length, 23);
assert.ok(fixtures.length >= 4);

let maxError = 0;
for (const sample of fixtures) {
  const result = predict(model, sample.features);
  maxError = Math.max(maxError, Math.abs(result.score - sample.expected));
  assert.ok(Math.abs(result.score - sample.expected) < 1e-10, sample.label);
  assert.equal(Number(result.predictedDefault), sample.class, sample.label);
}
for (const example of examples) {
  assert.ok(fixtures.some((sample) => sample.label === example.label));
}
assert.throws(() => predict(model, { ...fixtures[0].features, AGE: undefined }), /AGE/);
assert.throws(() => predict(model, { ...fixtures[0].features, SEX: "" }), /SEX/);
console.log(`${model.version}: ${fixtures.length} Python parity cases passed. Maximum absolute score error ${maxError.toExponential(3)}.`);
