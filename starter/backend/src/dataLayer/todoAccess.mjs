import AWSXRay from 'aws-xray-sdk-core';
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../utils/logger.mjs'
const logger = createLogger('dataLayer')
export class TodoAccess {
    constructor(
        S3ClientXRay = AWSXRay.captureAWSv3Client(new S3Client())
    ) {
        this.todosTable = process.env.TODOS_TABLE
        this.bucketName = process.env.S3_BUCKET
        this.urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
        this.todoCreated = process.env.TODOS_CREATED_AT_INDEX
        this.dbClient = DynamoDBDocument.from(AWSXRay.captureAWSv3Client(new DynamoDB()))
        this.s3ClientXRay = S3ClientXRay
    }
    async Create(todo) {
        logger.info(`log todo  ${todo} `);
        await this.dbClient.put({ TableName: this.todosTable, Item: todo, });
    }
    async Delete(todoId, userId) {
        logger.info(`delete todo ${todoId} `);
        await this.dbClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId,
            },
        });
    }
    async GetAll(userId) {
        logger.info(`get todo ${userId} `);
        const todos = await this.dbClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todoCreated,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            });

        return todos.Items;
    }
    async Update(todoId, userId, todo) {
        logger.info(`Update todo ${userId} `);
        await this.dbClient
            .update({
                TableName: this.todosTable,
                Key: {
                    userId: userId,
                    todoId: todoId,
                },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':name': todo.name,
                    ':dueDate': todo.dueDate,
                    ':done': todo.done,
                },
                ExpressionAttributeNames: {
                    '#name': 'name',
                },
            });
    }
    async GetUploadUrl(todoId) {
        const command = new PutObjectCommand({ Bucket: this.bucketName, Key: todoId })
        return await getSignedUrl(this.s3ClientXRay, command, {
            expiresIn: this.urlExpiration
        })
    }
    async Upload(todoId, userId, attachmentUrl) {
        logger.info(`Upload todo ${todoId} `);
        await this.dbClient
          .update({
            TableName: this.todosTable,
            Key: {
              userId: userId,
              todoId: todoId,
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
              ":attachmentUrl": attachmentUrl,
            }
          });
      }
}