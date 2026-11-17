#!/usr/bin/env bash
# Deploy Cloud Functions in small batches, retrying a batch that fails.
#
#   scripts/deploy-functions.sh fnA,fnB,fnC,...
#
# Why batches: deploying every function in one go makes Cloud Run start a new
# copy of each at once, which overran the project's regional CPU quota
# ("Quota exceeded for total allowable CPU per project per region") and left
# ~40 functions un-updated. A few at a time fits, and a batch that still hits
# the quota usually succeeds a minute or two later when old copies have gone.
#
# Env (all optional): BATCH_SIZE (3), RETRIES (3), RETRY_WAIT seconds (90),
# PROJECT (awakened-path-2026).
set -uo pipefail

names="${1:-}"
if [ -z "$names" ]; then
  echo "No functions to deploy."
  exit 0
fi

batch_size="${BATCH_SIZE:-3}"
retries="${RETRIES:-3}"
wait_s="${RETRY_WAIT:-90}"
project="${PROJECT:-awakened-path-2026}"

IFS=',' read -ra all <<< "$names"
echo "Deploying ${#all[@]} function(s) in batches of ${batch_size}: ${names}"

failed=()
for ((i = 0; i < ${#all[@]}; i += batch_size)); do
  chunk=("${all[@]:i:batch_size}")
  only=$(printf 'functions:%s,' "${chunk[@]}")
  only="${only%,}"
  ok=0
  for ((a = 1; a <= retries; a++)); do
    echo "::group::Deploy ${chunk[*]} (attempt ${a}/${retries})"
    if npx --yes firebase-tools@latest deploy --only "$only" \
         --project "$project" --non-interactive --force; then
      ok=1
      echo "::endgroup::"
      break
    fi
    echo "::endgroup::"
    if [ "$a" -lt "$retries" ]; then
      echo "Batch failed; waiting ${wait_s}s before retrying."
      sleep "$wait_s"
    fi
  done
  if [ "$ok" -ne 1 ]; then
    failed+=("${chunk[*]}")
  fi
done

if [ "${#failed[@]}" -gt 0 ]; then
  echo "::error::These functions failed to deploy after ${retries} attempts: ${failed[*]}"
  exit 1
fi
echo "All requested functions deployed."
