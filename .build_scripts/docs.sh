#!/usr/bin/env bash
set -e # halt script on error

# If this is the master branch, push it up to gh-pages
if [ $TRAVIS_PULL_REQUEST = "false" ] && [ $TRAVIS_BRANCH = ${PRODUCTION_BRANCH} ]; then
  echo "Get ready to publish the docs"
  npm run gendoc
  cd docs
  git init
  git config user.name "Travis-CI"
  git config user.email "travis@somewhere.com"
  git add .
  git commit -m "CI deploy to gh-pages"
  git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages
else
  echo "Not a deployable branch, so we're all done here"
fi
