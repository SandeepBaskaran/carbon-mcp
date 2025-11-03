// Type declarations for jscodeshift
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jscodeshift' {
  interface API {
    (source: string): Collection;
    importDeclaration: (specifiers: any[], source: any) => any;
    importSpecifier: (imported: any, local?: any) => any;
    identifier: (name: string) => any;
    literal: (value: any) => any;
    jsxIdentifier: (name: string) => any;
    jsxAttribute: (name: any, value: any) => any;
  }

  interface Collection {
    find: (type: any, selector?: any) => Collection;
    filter: (callback: (path: any) => boolean) => Collection;
    forEach: (callback: (path: any) => void) => void;
    at: (index: number) => Collection;
    insertBefore: (node: any) => void;
    toSource: (options?: any) => string;
    length: number;
  }

  const jscodeshift: API;
  export default jscodeshift;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

