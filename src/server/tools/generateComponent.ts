// src/server/tools/generateComponent.ts
import { renderInlineTemplate } from '../../lib/templateUtils';
import { safeWrite } from '../../lib/fileUtils';
import logger, { LogEntry } from '../../lib/logger';

export interface GenerateComponentInput {
  component_name: string;
  variant?: string;
  props?: Record<string, unknown>;
  carbon_version?: string;
  output_format?: 'files' | 'zip' | 'stdout';
  target_path?: string;
  dry_run?: boolean;
  confirm_destructive?: boolean;
  explain?: boolean;
}

export interface GenerateComponentOutput {
  files: Array<{ path: string; content: string }>;
  changed_files: string[];
  dry_run: boolean;
  logs: LogEntry[];
  trace_id: string;
  explanation?: string;
  error_code?: string;
  message?: string;
  hint?: string;
}

const componentTemplate = `import React from 'react';
import { Button } from 'carbon-components-react';

export interface {{componentName}}Props {
  children?: React.ReactNode;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tertiary';
{{#additionalProps}}
  {{name}}?: {{type}};
{{/additionalProps}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({ 
  children, 
  kind = 'primary',
{{#additionalProps}}
  {{name}},
{{/additionalProps}}
  ...props
}) => {
  return (
    <Button kind={kind} {...props}>
      {children}
    </Button>
  );
};

export default {{componentName}};
`;

const storyTemplate = `import React from 'react';
import { Meta, Story } from '@storybook/react';
import {{componentName}}, { {{componentName}}Props } from './{{componentName}}';

export default {
  title: 'Components/{{componentName}}',
  component: {{componentName}},
  argTypes: {
    kind: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger', 'tertiary'],
    },
  },
} as Meta;

const Template: Story<{{componentName}}Props> = (args) => <{{componentName}} {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: '{{componentName}} Button',
  kind: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  kind: 'secondary',
};

export const Ghost = Template.bind({});
Ghost.args = {
  children: 'Ghost Button',
  kind: 'ghost',
};
`;

const testTemplate = `import { render, screen } from '@testing-library/react';
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
`;

export async function generateComponent(input: GenerateComponentInput): Promise<GenerateComponentOutput> {
  const trace_id = `genc-${Date.now()}`;
  const logs: LogEntry[] = [];
  
  // Validate required fields
  if (!input.component_name) {
    return {
      files: [],
      changed_files: [],
      dry_run: true,
      logs,
      trace_id,
      error_code: 'missing_field',
      message: 'component_name is required',
      hint: 'Provide a component_name like "PrimaryCard"'
    };
  }

  const componentName = input.component_name;
  const target = input.target_path || `src/components/${componentName}`;
  
  // Parse additional props
  const additionalProps: Array<{ name: string; type: string }> = [];
  if (input.props) {
    for (const [name, type] of Object.entries(input.props)) {
      additionalProps.push({ name, type: String(type) });
    }
  }

  const context = {
    componentName,
    additionalProps: additionalProps.length > 0 ? additionalProps : undefined
  };

  const files = [
    {
      path: `${target}/${componentName}.tsx`,
      content: renderInlineTemplate(componentTemplate, context),
    },
    {
      path: `${target}/${componentName}.stories.tsx`,
      content: renderInlineTemplate(storyTemplate, context),
    },
    {
      path: `${target}/${componentName}.test.tsx`,
      content: renderInlineTemplate(testTemplate, context),
    },
  ];

  logs.push(logger.info(`Prepared ${files.length} files for ${componentName}`));

  const explanation = input.explain 
    ? `Generated Carbon React component "${componentName}" with ${additionalProps.length} custom props. Includes component file, Storybook story, and Jest tests. Uses Carbon Button as base with configurable kind prop.`
    : undefined;

  if (input.dry_run !== false) {
    logs.push(logger.info('Dry-run mode: no files written to disk'));
    return { files, changed_files: [], dry_run: true, logs, trace_id, explanation };
  }

  if (!input.confirm_destructive) {
    return {
      files,
      changed_files: [],
      dry_run: true,
      logs,
      trace_id,
      error_code: 'confirm_required',
      message: 'confirm_destructive must be true to write files',
      hint: 'Set confirm_destructive to true when you want to write files to disk'
    };
  }

  // Write actual files
  const changed: string[] = [];
  for (const f of files) {
    const result = safeWrite(f.path, f.content, { 
      dry_run: false, 
      confirm_destructive: true 
    });
    
    if (result.success && result.path) {
      changed.push(result.path);
      logs.push(logger.info(`Wrote ${result.path}`));
    } else if (result.error) {
      logs.push(logger.error(`Failed to write ${f.path}: ${result.error.message}`));
    }
  }

  return { 
    files, 
    changed_files: changed, 
    dry_run: false, 
    logs, 
    trace_id, 
    explanation 
  };
}

