#!/bin/bash

# Because of the monorepo structure, license-check from generate-license-file lib is an unable
# to properly parse all the relevant depedencies in the node_modules of a package. This script
# will temporarily copy the target package outside of the packages/ to generate the
# third-party-notice file and add it to the package.


PACKAGE_DIR=$(pwd)
PACKAGE_NAME=$(basename "$(pwd)")
REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMP_DIR="$REPO_DIR/temp-$PACKAGE_NAME"

echo "copying package $PACKAGE_DIR to $TEMP_DIR"
rm -rf $TEMP_DIR
# TODO: omit exclude test folders when it's moved to the root of the repo
rsync -av --exclude=node_modules --exclude=test-browser-esm --exclude=test-node-cjs "$PACKAGE_DIR/" "$TEMP_DIR/"
cd $TEMP_DIR
rm -rf node_modules
npm i --ignore-scripts
generate-license-file --input package.json --output THIRD-PARTY-NOTICES --overwrite
cp "$TEMP_DIR/THIRD-PARTY-NOTICES" $PACKAGE_DIR
rm -rf $TEMP_DIR