import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../../lambda/utils.mjs';
import { Delete } from '../../businessLogic/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('Log delete');
export const handler = middy().use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
  .handler(async (event) => {
    logger.info(`Deleting... `);
    const userId = getUserId(event.headers.Authorization)
    await Delete(event.pathParameters.todoId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Deleted successfully'
      })
    }
  })