import { predict } from "./inference.mjs";

const form = document.querySelector("#profile");
const examples = document.querySelector("#examples");
const output = document.querySelector("#result");
const run = document.querySelector("#run");
const labels = Object.fromEntries([
  ["LIMIT_BAL", "Credit limit (NT$)"], ["AGE", "Age"], ["SEX", "Sex code"],
  ["EDUCATION", "Education code"], ["MARRIAGE", "Marital status code"],
]);

async function load(name) {
  const response = await fetch(name);
  if (!response.ok) throw new Error("The model could not be loaded. Refresh the page to try again.");
  return response.json();
}

function addField(container, name, label, fieldType, values = []) {
  const wrapper = document.createElement("label");
  wrapper.textContent = label;
  const control = document.createElement(fieldType === "category" ? "select" : "input");
  control.name = name;
  control.required = true;
  if (fieldType === "category") {
    for (const code of values) control.add(new Option(code, code));
  } else {
    control.type = "number";
    control.step = "any";
  }
  wrapper.append(control);
  container.append(wrapper);
}

try {
  const [model, presets] = await Promise.all([load("model.json"), load("examples.json")]);
  const account = document.querySelector("#account");
  for (const name of ["LIMIT_BAL", "AGE"]) addField(account, name, labels[name], "number");
  for (const name of ["SEX", "EDUCATION", "MARRIAGE"]) {
    const field = model.categorical.find((item) => item.name === name);
    addField(account, name, labels[name], "category", field.values);
  }
  const repaymentNames = ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"];
  for (const [index, month] of ["Sep", "Aug", "Jul", "Jun", "May", "Apr"].entries()) {
    const row = document.createElement("div");
    row.className = "month-row";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", month);
    const title = document.createElement("strong");
    title.textContent = month;
    row.append(title);
    const field = model.categorical.find((item) => item.name === repaymentNames[index]);
    addField(row, field.name, "Repayment code", "category", field.values);
    addField(row, `BILL_AMT${index + 1}`, "Bill (NT$)", "number");
    addField(row, `PAY_AMT${index + 1}`, "Payment (NT$)", "number");
    document.querySelector("#history").append(row);
  }

  function useExample(index) {
    for (const [name, value] of Object.entries(presets[index].features)) {
      form.elements.namedItem(name).value = String(value);
    }
    output.textContent = "Example loaded. Select Run prediction.";
  }
  presets.forEach(({ label }, index) => examples.add(new Option(label, index)));
  examples.addEventListener("change", () => useExample(Number(examples.value)));
  form.addEventListener("input", () => { output.textContent = "Profile updated. Select Run prediction."; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    for (const {name} of model.numeric) fields[name] = Number(fields[name]);
    try {
      const {score, predictedDefault} = predict(model, fields);
      output.textContent = `${predictedDefault ? "Flagged for review" : "Below the review threshold"} · score ${score.toFixed(4)}`;
    } catch (error) {
      output.textContent = error.message;
    }
  });
  useExample(0);
  document.querySelector("#version").textContent = `Model ${model.version} · threshold ${model.threshold.toFixed(2)}`;
  examples.disabled = false;
  run.disabled = false;
} catch (error) {
  output.textContent = error.message;
}
