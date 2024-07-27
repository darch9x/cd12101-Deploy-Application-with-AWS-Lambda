import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { Upload } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs';
import { getUserId } from '../../lambda/utils.mjs';
const logger = createLogger('Log upload');
export const handler = middy().use(httpErrorHandler()).use(cors({
  credentials: true
}))
  .handler(async (event) => {
    logger.info(`Uploading `);
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event.headers.Authorization);
    const uploadUrl = await Upload(userId, todoId)

    return {
      statusCode: 201, body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  })
