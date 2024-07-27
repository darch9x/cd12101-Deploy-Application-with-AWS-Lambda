import { TodoAccess } from '../dataLayer/todoAccess.mjs'
import { getUrl } from '../fileStorage/attachment.mjs'
const todoAccess = new TodoAccess();
export async function Create(newTodo) {
    await todoAccess.Create(newTodo);
}
export async function Delete(todoId, userId) {
    await todoAccess.Delete(todoId, userId);
}
export async function GetAll(userId) {
    return await todoAccess.GetAll(userId);
}
export async function Update(todoId, userId, todo) {
    await todoAccess.Update(todoId, userId, todo);
}
export async function Upload(userId, todoId) {
    const attachmentUrl = getUrl(todoId)
    const url = await todoAccess.GetUploadUrl(todoId);
    await todoAccess.Upload(todoId, userId, attachmentUrl);
    return url;
}