import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const getSecret = async (secretName) => {
  let response;
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

// Your code goes here