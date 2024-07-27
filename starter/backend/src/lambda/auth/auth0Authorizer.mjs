import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
import pkg from 'jsonwebtoken'
const { verify, decode } = pkg;
const logger = createLogger('auth')

const jwksUrl = 'https://dev-zbqsvcxhbf26vcpa.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })
  const jwtKid = jwt.header.kid;
  let cert;
  try{
    const jwks = await Axios.get(jwksUrl);
    const signingKey = jwks.data.keys.filter(k => k.kid === jwtKid)[0];

    if (!signingKey) {
      throw new Error(`Key not matches ' ${jwtKid}'`);
    }
    cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJEXtyC4OQHeQTMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNVBAMTIWRldi16YnFzdmN4aGJmMjZ2Y3BhLnVzLmF1dGgwLmNvbTAeFw0yNDA3MjcwODEwNDdaFw0zODA0MDUwODEwNDdaMCwxKjAoBgNVBAMTIWRldi16YnFzdmN4aGJmMjZ2Y3BhLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKJaHxycEaAgrusA+jcXGpqwCQd7H0ccbqY/JXrX5MtIq2nXUtbx6Mx/IIBzYYa41npvoT3i9UqzDT6rBuSVcdaJAM5edEi4ws/1/HtDHcRFN4m1d5MvjvgwAH51iSgsFo5PT/CNurX3M6skxOypelLOPSmxJy/v2atr9Krk10Y+8CBWbXp8nu5KlmKERau76Wpo0FEei1spDQUuUI4BjAwQAWi/l1POzL4UTe35CBa8r21CSA3WfpidB57dlewCM3rRnzX+38VzgnwSKSHiMsfOxzSNJRdzqlQ9Hq8A38NV3QKcSm1R+PnWaCjkrgaPK5bQw5Rci9G5gR/IBWf/N00CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUctIL+u3ucmRJEyB/PTFLZw0U+qwwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQBp3B+Vew1yWsRAz+fPSPSDLO4GG3I6HUtaRY6cnfZcxoFCrX/nntBAuqp30OUFCZ7nPQQOsB7Ai+yvkuwwO6zPmL5JCNqfZvrB8hMdyvcELeWg7V8ryA4Hum9veR7ayA+oydM5O7aUtkD/Ct5Xv1LcKGpL3GxjCZRg0xwu4kfWLc04d3TfgQVkHII7InqMbnJMQjIWmn9TTmhbTc0B6cFJ+KlOTpi/fdrp0h3Nc5Ih8VtV+ICAOG9RDjojjTu3r9U5uW32cmfr4DUc50S8mR9uWzta9yPOZmuXmAXEMrksHWt0NYOh7xn98p+W+Vwjb9IS5sqQaFAMxfobOEpdcFPR
-----END CERTIFICATE-----`;
  } catch(error) {
    console.log('certificate  fail: ' , error);
  }

   return verify(token, cert, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
