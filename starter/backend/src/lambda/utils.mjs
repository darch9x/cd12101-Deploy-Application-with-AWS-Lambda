import { decode } from 'jsonwebtoken';
export function getUserId(authorizationHeader) {

    const split = authorizationHeader.split(' ')
    const jwtToken = split[1]
  
    const decodedJwt = decode(jwtToken)
    return decodedJwt.sub
  }