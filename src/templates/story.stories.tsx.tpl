import React from 'react';
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

