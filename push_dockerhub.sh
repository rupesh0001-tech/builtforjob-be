#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Help message
show_help() {
    echo "Usage: ./push_dockerhub.sh <dockerhub-username>"
    echo "Example: ./push_dockerhub.sh rupesh0001"
    exit 1
}

# Check if argument is provided
if [ -z "$1" ]; then
    show_help
fi

DOCKERHUB_USER=$1
REPO_NAME="builtforjob-be"
IMAGE_TAG="latest"
FULL_IMAGE_URI="${DOCKERHUB_USER}/${REPO_NAME}:${IMAGE_TAG}"

echo "========================================="
echo "Starting Build and Push Script for Docker Hub"
echo "Target Image: ${FULL_IMAGE_URI}"
echo "========================================="

# Step 1: Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker daemon is not running. Please start Docker Desktop first."
    exit 1
fi

# Step 2: Prompt user to authenticate if not already logged in
echo "🔑 Logging into Docker Hub (if prompted, enter your credentials)..."
docker login

# Step 3: Build Docker Image for production (linux/amd64 platform is best for cloud hosting compatibility)
echo "🐳 Building Docker image for target architecture (linux/amd64)..."
docker build --platform linux/amd64 -t "${REPO_NAME}:${IMAGE_TAG}" .

# Step 4: Tag the image with Docker Hub credentials
echo "🏷️ Tagging image for Docker Hub..."
docker tag "${REPO_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_URI}"

# Step 5: Push the image to Docker Hub
echo "🚀 Pushing image to Docker Hub..."
docker push "${FULL_IMAGE_URI}"

echo "========================================="
echo "🎉 Successfully built and pushed to Docker Hub!"
echo "Image URI: ${FULL_IMAGE_URI}"
echo "========================================="
