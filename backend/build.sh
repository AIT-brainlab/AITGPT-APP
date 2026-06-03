#!/bin/bash

# The script try to realize the VERSION based on 
# 1. User version input
# 2. If no user input, then use the version from uv version

VERSION=$1

if [[ -z "$VERSION" ]]; then
    read -p "Do you want to change the version? (y/N): " CHANGE_VERSION
    if [[ "$CHANGE_VERSION" =~ ^[Yy]$ ]]; then
        read -p "Enter new version: " VERSION
    else
        VERSION=$(uv version --short)
    fi
fi

if [[ -n "$VERSION" ]]; then
    VERSION=$(uv version ${VERSION} --short)
fi

export TAG="v${VERSION}"
echo "TAG: $TAG"
cd dist && docker buildx bake --allow=fs.read=..