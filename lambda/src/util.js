const getSecret = async (secretName)  => {
    let response;
    const {  SecretsManagerClient, GetSecretValueCommand, } = require('@aws-sdk/client-secrets-manager');
    const client = new SecretsManagerClient({
        region: "us-east-2",
    });

  response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  return response.SecretString;
  }
  
  
  module.exports = {getSecret}
    
    // Your code goes here