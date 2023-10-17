function clean {
	local repo=$1
	cd $repo
	rm -rf package-lock.json node_modules
	npm i
}

repos=(jsutil eslint-config-ts spec emit)
for repo in ${repos[@]}; do
	clean $repo
	cd ..
done

clean .
npx husky install
