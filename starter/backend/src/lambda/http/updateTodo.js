import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { Update } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../../lambda/utils.mjs';
const logger = createLogger('Log Update');
export const handler = middy().use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
  .handler(async (event) => {
    logger.info(`Updating... `);
    const userId = getUserId(event.headers.Authorization)
    const { name, done } = JSON.parse(event.body);
    await Update(event.pathParameters.todoId, userId, {
      name, done, dueDate: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Updated successfully'
      })
    }
  })