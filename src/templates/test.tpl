import { render, screen } from '@testing-library/react';
import {{componentName}} from './{{componentName}}';

describe('{{componentName}}', () => {
  test('renders component with children', () => {
    render(<{{componentName}}>Test Content</{{componentName}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('applies correct kind prop', () => {
    const { container } = render(
      <{{componentName}} kind="primary">Primary</{{componentName}}>
    );
    const button = container.querySelector('button');
    expect(button).toHaveClass('bx--btn--primary');
  });

  test('renders with default props', () => {
    const { container } = render(<{{componentName}}>Default</{{componentName}}>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});

