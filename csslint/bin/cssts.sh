#!/usr/bin/env bash

args=""
tsxArgs=""

isTsxArg=
for item in $@; do
	if [[ $item = "--" ]]; then
		isTsxArg=1
		continue
	fi

	if [[ $isTsxArg = 1 ]]; then
		tsxArgs+="$item "
	else
		args+="$item "
	fi
done

binPath=$(dirname $0)

bash -c "npx tsx $tsxArgs $binPath/cssjs $args"
