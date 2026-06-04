#!/bin/bash

RG="<RESOURCE_GROUP>"
PLAN="<APP_SERVICE_PLAN>"
APP="<APP_NAME>"
SUB="<SUBSCRIPTION_ID>"
SEARCH="<SEARCH_NAME>"
OPENAI="<OPENAI_RESOURCE>"
DEPLOY="<DEPLOYMENT_NAME>"
VNET="<VNET_NAME>"
SUBNET="<SUBNET_NAME>"
NAT="<NAT_NAME>"
IP="<PUBLIC_IP_NAME>"

echo "🔧 Updating App Service Plan to 2 instances..."
az appservice plan update --name $PLAN --resource-group $RG --number-of-workers 2

echo "🔧 Enabling zone redundancy..."
az appservice plan update --name $PLAN --resource-group $RG --sku P1v3 --zone-redundant true

echo "🔧 Enabling Health Check..."
az webapp update --name $APP --resource-group $RG --set healthCheckPath="/health"

echo "🔧 Upgrading to Standard tier..."
az appservice plan update --name $PLAN --resource-group $RG --sku S1

echo "🔧 Creating Service Health alert..."
az monitor activity-log alert create \
  --name "AzureServiceHealth" \
  --resource-group $RG \
  --scopes /subscriptions/$SUB \
  --condition "category=ServiceHealth"

echo "🔧 Updating Azure OpenAI deployment..."
az cognitiveservices account deployment update \
  --name $OPENAI --resource-group $RG \
  --deployment-name $DEPLOY --model-version "latest"

echo "🔧 Adding replica to Azure AI Search..."
az search service update --name $SEARCH --resource-group $RG --replica-count 2

echo "🔧 Creating NAT Gateway..."
az network nat gateway create --resource-group $RG --name $NAT --public-ip-addresses $IP

echo "🔧 Attaching NAT Gateway to subnet..."
az network vnet subnet update --resource-group $RG --vnet-name $VNET --name $SUBNET --nat-gateway $NAT

echo "🎉 All Azure reliability improvements applied!"
