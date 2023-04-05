#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR="${DIR}/.."

  cd "${ROOT_DIR}"/cdk
  npm ci
  npm run lint
  npm run test
  npm run synth
  npm run build
