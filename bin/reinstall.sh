source "$(dirname "$0")/_repos.sh"

for repo in ${repos[@]}; do
	cd $repo
	rm -rf node_modules
	npm i
	cd ..
done

rm -rf node_modules
npm i
