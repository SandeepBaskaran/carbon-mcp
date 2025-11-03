import React from 'react';
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

