#!/usr/bin/env bash

source "$(dirname "$0")/_repos.sh"

for repo in ${repos[@]}; do
	npx npm-check-updates --cwd $repo
done

npx npm-check-updates
