#!/bin/bash

# Ensure we exit on failure
set -e

echo "🔗 Linking to Railway project 'genuine-warmth'..."
# The user will be prompted if necessary, but since they run this in a real terminal, it will work.

echo "🗄️ Provisioning PostgreSQL..."
railway add -d postgres || echo "PostgreSQL might already be added."

echo "🗄️ Provisioning Redis..."
railway add -d redis || echo "Redis might already be added."

echo "🚀 Deploying NATS..."
# Add the NATS service (this creates a new service in Railway)
railway add -s nats || echo "NATS service might already exist."
# Deploy the NATS Dockerfile
cd infra/nats
railway up -s nats -d
cd ../../

echo "🔐 Deploying auth-service..."
# Add the auth-service
railway add -s auth-service || echo "auth-service might already exist."
# Set the build argument
railway run --service auth-service railway variables set SERVICE_NAME=auth-service
# Deploy the root Dockerfile to the auth-service
railway up -s auth-service -d

echo "✅ Deployment initiated! Check the Railway Dashboard for build progress."
