import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { TodoProvider } from '@/context/TodoContext';
import CategoryFilter from '@/components/CategoryFilter';

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

describe('CategoryFilter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupDefaultMocks(api as unknown as Record<string, jest.Mock>);
  });

  it('renders all categories plus the "All" option', async () => {
    render(<CategoryFilter />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    const selectInput = screen.getByRole('combobox');
    const selectContainer = selectInput.closest('.ant-select')!;
    
    await act(async () => {
      selectContainer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    await waitFor(() => {
      const optionItems = document.querySelectorAll('.ant-select-item-option-content');
      const optionTexts = Array.from(optionItems).map((o) => o.textContent);
      expect(optionTexts.length).toBeGreaterThanOrEqual(2);
      expect(optionTexts).toContain('All Categories');
      expect(optionTexts).toContain('Work');
    });
  });

  it('calls setSelectedCategory when a category is selected', async () => {
    render(<CategoryFilter />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const selectInput = screen.getByRole('combobox');
    const selectContainer = selectInput.closest('.ant-select')!;
    
    await act(async () => {
      selectContainer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    const workOption = await screen.findByText('Work');
    await act(async () => {
      await user.click(workOption);
    });

    await waitFor(() => {
      expect(jest.mocked(api.getTodos)).toHaveBeenCalledWith(1);
    });
  });
});
