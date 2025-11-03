// src/lib/codemodUtils.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import jscodeshift from 'jscodeshift';

export interface CodemodRule {
  from: string;
  to: string;
  type?: 'jsx' | 'import' | 'className';
}

export function applyJSCodemod(
  source: string,
  codemodName: string,
  rules: Record<string, unknown>
): string {
  const j = jscodeshift;
  const root = j(source);

  switch (codemodName) {
    case 'btn-old-to-carbon':
      return applyButtonCarbonCodemod(root, j);
    case 'class-to-style':
      return applyClassToStyleCodemod(root, j, rules);
    default:
      return applyGenericCodemod(root, j, rules);
  }
}

function applyButtonCarbonCodemod(root: any, j: any): string {
  // Find all <button className="btn-old"> and replace with Carbon Button
  let modified = false;

  // Add import if not present
  const hasImport = root
    .find(j.ImportDeclaration, {
      source: { value: 'carbon-components-react' }
    })
    .filter((path: any) => {
      return path.value.specifiers.some(
        (spec: any) => spec.imported && spec.imported.name === 'Button'
      );
    })
    .length > 0;

  if (!hasImport) {
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.length > 0) {
      firstImport.insertBefore(
        j.importDeclaration(
          [j.importSpecifier(j.identifier('Button'))],
          j.literal('carbon-components-react')
        )
      );
      modified = true;
    }
  }

  // Replace button elements
  root.find(j.JSXElement, {
    openingElement: { name: { name: 'button' } }
  }).forEach((path: any) => {
    const attributes = path.value.openingElement.attributes;
    const hasOldClass = attributes.some(
      (attr: any) =>
        attr.type === 'JSXAttribute' &&
        attr.name.name === 'className' &&
        attr.value.value === 'btn-old'
    );

    if (hasOldClass) {
      // Replace button with Button
      path.value.openingElement.name = j.jsxIdentifier('Button');
      if (path.value.closingElement) {
        path.value.closingElement.name = j.jsxIdentifier('Button');
      }

      // Replace className with kind
      path.value.openingElement.attributes = attributes
        .filter((attr: any) => !(attr.name && attr.name.name === 'className'))
        .concat([
          j.jsxAttribute(
            j.jsxIdentifier('kind'),
            j.literal('primary')
          )
        ]);
      modified = true;
    }
  });

  return modified ? root.toSource() : root.toSource();
}

function applyClassToStyleCodemod(root: any, _j: any, _rules: Record<string, unknown>): string {
  // Placeholder for class-to-style codemod
  return root.toSource();
}

function applyGenericCodemod(root: any, j: any, rules: Record<string, unknown>): string {
  // Generic codemod based on rules
  if (rules.replaceJSX) {
    for (const [from, to] of Object.entries(rules.replaceJSX)) {
      root.find(j.JSXIdentifier, { name: from }).forEach((path: any) => {
        path.value.name = to;
      });
    }
  }

  return root.toSource();
}

