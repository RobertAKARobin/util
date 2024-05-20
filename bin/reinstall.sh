#!/usr/bin/env bash

source "$(dirname "$0")/_repos.sh"

root=$(pwd)

for repo in ${repos[@]}; do
	cd $repo
	echo ">>> $repo"
	rm -rf node_modules package-lock.json
	npm i
	cd $root
done
