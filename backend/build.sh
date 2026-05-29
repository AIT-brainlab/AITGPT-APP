#!/bin/bash
export TAG=$(git tag --points-at HEAD)
echo "tag=${TAG}"
export VERSION=$(uv version ${TAG} --short)
cd dist && docker buildx bake --allow=fs.read=..