source "$(dirname "$0")/_repos.sh"

function dowhat {
	local repo=$1
	cd $repo
	rm -rf package-lock.json node_modules
	npm i
}

for repo in ${repos[@]}; do
	dowhat $repo
	cd ..
done

dowhat .
npx husky install
