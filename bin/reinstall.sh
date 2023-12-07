source "$(dirname "$0")/_repos.sh"

root=$(pwd)

for repo in ${repos[@]}; do
	cd $repo
	echo ">>> $repo"
	rm -rf node_modules
	npm i
	cd $root
done

rm -rf node_modules
npm i
