#
# precommit.sh - Run this script prior to commiting any changes to git to ensure
# that all code is properly updated, formatted, linted and tested.
#
echo '*** Adding to git'
git add .

# udd:  https://github.com/hayd/deno-udd
echo '*** Updating dependencies'
udd ./mod.ts
udd ./mod_test.ts

echo '*** Formatting code'
deno fmt

echo '*** Linting code ***'
deno lint

echo '*** Testing code'
deno test -A

echo '*** Check unstable also compiles'
deno cache --reload --unstable mod.ts

echo '*** Checking git status'
git status

echo '#####'
echo "Latest tag is: $(git describe --abbrev=0)"
echo 'To sign a new tag:  git tag -s 1.3.13 -m "your tag message"'
echo 'To push tags:       git push --tags'
echo '#####'