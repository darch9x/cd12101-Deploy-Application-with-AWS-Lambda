import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../../lambda/utils.mjs';
import { GetAll } from '../../businessLogic/todos.mjs'
export const handler = middy().use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
  .handler(async (event) => {
    const userId = getUserId(event.headers.Authorization);
    const items = await GetAll(userId);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items
      })
    }
  })