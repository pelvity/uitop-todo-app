import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { TodoProvider } from '@/context/TodoContext';
import CreateTodoForm from '@/components/CreateTodoForm';

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

describe('CreateTodoForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupDefaultMocks(api as unknown as Record<string, jest.Mock>);
  });

  it('renders form with input, select, and submit button', async () => {
    render(<CreateTodoForm />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<CreateTodoForm />, { wrapper: TestWrapper });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText('Text is required')).toBeInTheDocument();
    });
  });

  it('calls createTodo on valid submit', async () => {
    render(<CreateTodoForm />, { wrapper: TestWrapper });
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText('What needs to be done?'),
      'Test todo',
    );

    // Open the antd Select dropdown via mouseDown on the selector
    const selectInput = screen.getByRole('combobox');
    const selectContainer = selectInput.closest('.ant-select')!;
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    selectContainer.dispatchEvent(mouseDownEvent);

    const workOption = await screen.findByText('Work');
    await user.click(workOption);

    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(jest.mocked(api.createTodo)).toHaveBeenCalledWith(
        'Test todo',
        expect.any(Number),
      );
    });
  });
});
