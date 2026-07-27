'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * Task object type
 * @typedef {Object} Task
 * @property {number} id - Unique task identifier
 * @property {string} title - Task title
 * @property {boolean} completed - Whether the task is completed
 * @property {string} created_at - ISO 8601 timestamp of task creation
 */
export type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

/**
 * Fetches all tasks from the API
 * 
 * Makes a GET request to the API to retrieve all tasks.
 * Results are not cached to ensure fresh data on each request.
 * 
 * @async
 * @returns {Promise<Task[]>} Array of task objects
 * @throws {Error} If the API request fails or returns an error status
 * 
 * @example
 * const tasks = await getTasks();
 * console.log(tasks); // [{ id: 1, title: 'Buy milk', completed: false, ... }]
 */
export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

/**
 * Creates a new task
 * 
 * Submits a form with a task title to the API and revalidates the page cache.
 * Intended to be used as a server action in a form.
 * 
 * @async
 * @param {FormData} formData - Form data containing the task title
 * @param {string} formData.title - The title of the new task
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails
 * 
 * @example
 * <form action={createTask}>
 *   <input name="title" type="text" required />
 *   <button type="submit">Add Task</button>
 * </form>
 */
export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  revalidatePath('/');
}

/**
 * Toggles the completion status of a task
 * 
 * Updates a task's completed status via a PATCH request to the API
 * and revalidates the page cache.
 * 
 * @async
 * @param {number} id - The ID of the task to update
 * @param {boolean} completed - The new completion status
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails
 * 
 * @example
 * await toggleTask(1, true); // Mark task 1 as completed
 */
export async function toggleTask(id: number, completed: boolean) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  revalidatePath('/');
}
