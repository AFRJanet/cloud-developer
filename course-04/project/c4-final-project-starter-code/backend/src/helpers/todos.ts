import { TodosAccess }  from './todosAcess'
import { createUploadPresignedUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('todos')

let todoAcess = new TodosAccess();

export function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

   const todoId = uuid.v4()

   const presignedUrl = createUploadPresignedUrl(todoId)

   let signedUrl:string = ''

   presignedUrl.then(value => signedUrl = value)

   const newItem : TodoItem = {
      userId: userId,
      todoId: todoId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      attachmentUrl: signedUrl
   }
   
   const result = todoAcess.createTodo(newItem)

   logger.info('New Todo Item is created', {
      item: result
   })

   return result as Promise<TodoItem>
}


export function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<TodoUpdate>
{
   const newUpdate:TodoUpdate = {
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done
   }

   const result = todoAcess.updateTodo(newUpdate, userId, todoId)

   logger.info(`The TodoId: ${todoId} was updated with the result: ${result}`)

   return result as Promise<TodoUpdate>
}

export function deleteTodo(todoId: string, userId: string) {
   return todoAcess.deleteTodo(todoId, userId)
}

export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
   return todoAcess.createAttachmentPresignedUrl(todoId)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
   return todoAcess.getTodosForUser(userId)
}