#!/bin/bash

# The script try to realize the VERSION based on 
# 1. git tag
# if missing git tag,

export TAG=$(git tag --points-at HEAD)

# if this commit has a tag
if TAG

export VERSION=$(uv version --short)
echo "Current version: $VERSION"

NEW_VERSION=$1

if [[ -z "$NEW_VERSION" ]]; then
    read -p "Do you want to change the version? (y/N): " CHANGE_VERSION
    if [[ "$CHANGE_VERSION" =~ ^[Yy]$ ]]; then
        read -p "Enter new version: " NEW_VERSION
    fi
fi

if [[ -n "$NEW_VERSION" ]]; then
    VERSION=$(uv version ${NEW_VERSION} --short)
fi

export TAG="v${VERSION}"
echo "TAG: $TAG"
cd dist && docker buildx bake --allow=fs.read=..