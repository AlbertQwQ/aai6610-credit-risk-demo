// Mirror the fitted ColumnTransformer and the binary scikit-learn MLP.
export function predict(model, raw) {
  let activations = [];
  for (const { name, mean, scale } of model.numeric) {
    const value = raw[name];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Enter a finite number for ${name}.`);
    }
    activations.push((value - mean) / scale);
  }
  for (const { name, values } of model.categorical) {
    const value = raw[name];
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`Enter a category code for ${name}.`);
    }
    activations.push(...values.map((category) => Number(category === String(value))));
  }

  for (let layerIndex = 0; layerIndex < model.layers.length; layerIndex += 1) {
    const { weights, bias } = model.layers[layerIndex];
    const lastLayer = layerIndex === model.layers.length - 1;
    if (weights.length !== activations.length) throw new Error("Model dimensions do not match the input.");
    activations = bias.map((offset, output) => {
      let sum = offset;
      for (let input = 0; input < activations.length; input += 1) {
        sum += activations[input] * weights[input][output];
      }
      return lastLayer ? 1 / (1 + Math.exp(-sum)) : Math.max(0, sum);
    });
  }

  const score = activations[0];
  if (!Number.isFinite(score)) throw new Error("The input values are too large to score.");
  return { score, predictedDefault: score > model.threshold };
}
