#!/bin/bash

echo "Started building preloaders (sequential)"

# The webpack-based preloader builds (notably the Angular 20 path) run out of the default
# Node heap and fail with "Ineffective mark-compacts near heap limit - out of memory".
# Raise the heap before invoking Nx/webpack.
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=8192"

STATUS1=0
STATUS2=0
STATUS3=0
STATUS4=0
STATUS5=0

echo "Building Angular 18..."
(cd ./pre_loaders/angular-18 && npm run build) || STATUS1=$?

echo "Building Angular 19..."
(cd ./pre_loaders/angular-19 && npm run build) || STATUS2=$?

echo "Building Angular 20..."
(cd ./pre_loaders/angular-20 && npm run build) || STATUS3=$?

echo "Building Angular 21..."
(cd ./pre_loaders/angular-21 && npm run build) || STATUS4=$?

echo "Building React 19..."
(cd ./pre_loaders/react-19 && npm run build) || STATUS5=$?

# Check if any build failed
if [[ $STATUS1 -ne 0 || $STATUS2 -ne 0 || $STATUS3 -ne 0 || $STATUS4 -ne 0 || $STATUS5 -ne 0 ]]; then
  echo "One or more builds failed."
  exit 1
else
  echo "All builds completed successfully."
fi
