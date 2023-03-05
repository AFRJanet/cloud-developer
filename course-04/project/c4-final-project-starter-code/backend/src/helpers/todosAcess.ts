import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')
// import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly s3Bucket = new XAWS.S3({ signatureVersion: 'v4' })
  ) { }

   public async createTodo(todoItem: TodoItem): Promise<TodoItem> {

    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise();

    logger.info(`New Todo item is created: ${result}`);
    return todoItem as TodoItem;
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {

    const result = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise();

    logger.info(`TodoIt: ${todoId} is deleted. Result: ${result}.`);

    return "" as string;
  }

  async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    const result = await this.s3Bucket.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: urlExpiration
    }); //.promise()

    logger.info(`PresignedUrl received: url: ${result}`);

    return result as string;
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };

    const result = await this.docClient.query(params).promise();
    logger.info(`All Todos are requested from UserId: ${userId} with the result ${result}`);

    return result.Items as TodoItem[];
  }

  async updateTodo(todoUpdate: TodoUpdate, userId: string, todoId: string) : Promise<TodoUpdate> {
    const params = {
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c",
      ExpressionAttributeNames: {
          "#a": "name",
          "#b": "dueDate",
          "#c": "done"
      },
      ExpressionAttributeValues: {
          ":a": todoUpdate['name'],
          ":b": todoUpdate['dueDate'],
          ":c": todoUpdate['done']
      },
      ReturnValues: "updated"
  };

  const result = await this.docClient.update(params).promise();
  logger.info(`The TodoId: ${todoId} is updated ${result}`);

  return result.Attributes as TodoUpdate;
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:3000'
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
