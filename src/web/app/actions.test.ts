/**
 * Unit tests for src/web/app/actions.ts
 * 
 * Tests the server actions for task management.
 */

import { getTasks, createTask, toggleTask, Task } from './actions';

// Mock fetch
global.fetch = jest.fn();

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    test('should fetch tasks from API', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test task',
          completed: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const tasks = await getTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(tasks).toEqual(mockTasks);
    });

    test('should throw error if fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(getTasks()).rejects.toThrow('Failed to fetch tasks');
    });

    test('should throw error if network fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getTasks()).rejects.toThrow('Network error');
    });
  });

  describe('createTask', () => {
    test('should post task to API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'New task', completed: false }),
      });

      const formData = new FormData();
      formData.append('title', 'New task');

      await createTask(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New task' }),
        })
      );
    });

    test('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const formData = new FormData();
      formData.append('title', 'New task');

      await expect(createTask(formData)).rejects.toThrow('API error');
    });
  });

  describe('toggleTask', () => {
    test('should patch task completion status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, title: 'Task', completed: true }),
      });

      await toggleTask(1, true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        })
      );
    });

    test('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      await expect(toggleTask(1, true)).rejects.toThrow('API error');
    });
  });
});
