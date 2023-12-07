source "$(dirname "$0")/_repos.sh"

root=$(pwd)

function dowhat {
	local repo=$1
	cd $repo

	if [[ $repo == "example" ]]; then
		return 0
	fi

	echo ">>> $repo"
	ncu
	npm install
	if [[ -z $(npm diff) ]]; then
		return 1
	fi

	npm version patch
	npm i
	npm publish
	sleep 2
}

for repo in ${repos[@]}; do
	dowhat $repo
	cd $root
done
