#!/usr/bin/env bash

source "$(dirname "$0")/_repos.sh"

local root=$(pwd)

function dowhat {
	local repo=$1
	cd $repo
	rm -rf package-lock.json node_modules
	npm i
}

for repo in ${repos[@]}; do
	dowhat $repo
	cd $root
done
