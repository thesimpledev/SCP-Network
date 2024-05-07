# Site Deplyment Script
$s3DirectoryPath = Join-Path -Path $PSScriptRoot -ChildPath "site/"
aws s3 sync $s3DirectoryPath s3://securecontainprotect.network --delete

# Lamnda Deployment Script
$deployFile = "lambdadeploy.zip";
$deployFunction = "scpnetwork";
$s3Bucklet = "deploy-thesimpledev-com-sdjk498f6vxuy";
npm install;
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "esbuild ./lambda/src/index.js --bundle --minify --platform=node --target=node16 --outfile=./lambda/dist/index.js" -Wait
Compress-Archive -Path "lambda\dist\*" -DestinationPath "lambdadeploy.zip" -Force;
aws  s3 cp $deployFile s3://$($s3Bucklet)/$($deployFile);
aws lambda  update-function-code --function-name $($deployFunction) --s3-bucket $s3Bucklet --s3-key $deployFile | Out-Null;
Write-Host "Deployed $($deployFunction) from $($deployFile)"