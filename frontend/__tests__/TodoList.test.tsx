import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { TodoProvider } from '@/context/TodoContext';
import TodoList from '@/components/TodoList';

jest.mock('@/lib/api');
import * as api from '@/lib/api';
import { setupDefaultMocks } from './mocks/api';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <App>
      <TodoProvider>{children}</TodoProvider>
    </App>
  );
}

describe('TodoList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupDefaultMocks(api as unknown as Record<string, jest.Mock>);
  });

  it('renders todos from context', async () => {
    render(<TodoList />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
    expect(screen.getByText('Finish report')).toBeInTheDocument();
  });

  it('shows empty state when no todos', async () => {
    jest.mocked(api.getTodos).mockResolvedValue([]);

    render(<TodoList />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('You are all caught up!')).toBeInTheDocument();
    });
  });

  it('checkbox toggle calls updateTodo', async () => {
    render(<TodoList />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);

    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(jest.mocked(api.updateTodo)).toHaveBeenCalledWith(1, {
        completed: true,
      });
    });
  });
});
