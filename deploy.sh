#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Help message
show_help() {
    echo "Usage: ./deploy.sh <aws-account-id> <aws-region>"
    echo "Example: ./deploy.sh 123456789012 us-east-1"
    exit 1
}

# Check if arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    show_help
fi

AWS_ACCOUNT_ID=$1
AWS_REGION=$2
REPO_NAME="builtforjob-be"
IMAGE_TAG="latest"
REGISTRY_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
FULL_IMAGE_URI="${REGISTRY_URL}/${REPO_NAME}:${IMAGE_TAG}"

echo "========================================="
echo "Starting Build and Push Script for ECR"
echo "Target Registry: ${REGISTRY_URL}"
echo "Repository Name: ${REPO_NAME}"
echo "========================================="

# Step 1: Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed or not in PATH."
    echo "Please install it from https://aws.amazon.com/cli/ and run 'aws configure' first."
    exit 1
fi

# Step 2: Authenticate Docker to AWS ECR
echo "🔑 Logging into AWS ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY_URL}"

# Step 3: Check if ECR Repository exists, if not, create it
echo "📦 Checking repository existence..."
if ! aws ecr describe-repositories --repository-names "${REPO_NAME}" --region "${AWS_REGION}" &> /dev/null; then
    echo "⚠️ Repository '${REPO_NAME}' does not exist. Creating repository..."
    aws ecr create-repository --repository-name "${REPO_NAME}" --region "${AWS_REGION}"
    echo "✅ Repository created successfully."
else
    echo "✅ Repository exists."
fi

# Step 4: Build Docker Image for AWS compatibility (linux/amd64 platform)
echo "🐳 Building Docker image for target architecture (linux/amd64)..."
docker build --platform linux/amd64 -t "${REPO_NAME}:${IMAGE_TAG}" .

# Step 5: Tag the image with the remote ECR repository URI
echo "🏷️ Tagging image..."
docker tag "${REPO_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_URI}"

# Step 6: Push the image to AWS ECR
echo "🚀 Pushing image to AWS ECR..."
docker push "${FULL_IMAGE_URI}"

echo "========================================="
echo "🎉 Successfully built and pushed container!"
echo "Image URI: ${FULL_IMAGE_URI}"
echo "========================================="
