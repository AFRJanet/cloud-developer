import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

export async function createTodo(createTodoRequest: CreateTodoRequest, userId:string): Promise<TodoItem> {

   const itemId = uuid.v4()

   return await TodosAccess.createTodo({
      id: itemId,
      userId: userId,
      name: createTodoRequest.name,
      timestamp: new Date().toISOString()
   })
}


export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId:string): Promise<TodoItem> {
   
   return await TodosAccess.updatedTodo({
      id: todoId,
      name: updateTodoRequest.name,
      done: updateTodoRequest.done,
      timestamp: new Date().toISOString()
   })
}

export async function deleteTodo(todoId: string) 
{
   // TODO:
   return await TodosAccess.deleteTodo(todoId)
}

export async function createAttachmentPresignedUrl(todoId: string) : Promise<string> {
// TODO:
   
   
}