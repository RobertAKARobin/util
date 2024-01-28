source "$(dirname "$0")/_repos.sh"

root=$(pwd)

for repo in ${repos[@]}; do
	cd $repo
	echo ">>> $repo"
	rm -rf node_modules
	rm package-lock.json
	npm i
	cd $root
done
