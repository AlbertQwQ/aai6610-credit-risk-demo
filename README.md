---
title: Credit Risk Model Demo
emoji: 📊
colorFrom: green
colorTo: gray
sdk: static
app_file: index.html
pinned: false
---

# Credit Risk Model Demo

AAI 6610 coursework demonstration. Select a fictional credit card profile and run the trained neural network in your browser. The app loads the fitted preprocessing and model parameters from `model.json`. A score over 0.50 flags a profile for review. Scores illustrate model behavior. Use fictional inputs and keep the app separate from lending decisions.

## Local verification

`node check.mjs` compares JavaScript predictions against Python reference results on four fictional profiles and checks missing-input handling. Serve this directory over HTTP to use the form.

## Deployment

Set the GitHub Actions repository variable `HF_SPACE_ID` to the target `owner/space-name` and store a write-capable token for that Space as the Actions repository secret `HF_TOKEN`. The workflow verifies predictions before syncing the main branch to a Static Space. The repository contains app files, fitted parameters and synthetic profiles.


## Live demonstration

[Open the coursework demo on Hugging Face](https://huggingface.co/spaces/AlbertQwQ/aai6610-credit-risk-demo). Choose a fictional profile, then select **Run prediction**.
