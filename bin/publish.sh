source "$(dirname "$0")/_repos.sh"

function dowhat {
	local repo=$1
	cd $repo
	echo ">>> $repo"
	ncu
	npm install
	if [[ -z $(npm diff) ]]; then
		return
	fi

	npm version patch
	npm i
	npm publish
	sleep 2
}

for repo in ${repos[@]}; do
	dowhat $repo
	cd ..
done
