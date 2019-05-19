import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';

export type NamingConvention = 'lowerCamelCase' | 'UPPER_CASE';

function upperFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

function camelize(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/)
    .reduce((result, word, index) => {
      word = word.toLowerCase();
      return result + (index ? upperFirst(word) : word);
    }, '');
}

function upperize(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, '_')
    .toUpperCase();
}

function useNamingConvention(str: string, namingConvention?: NamingConvention): string {
  if (namingConvention === 'lowerCamelCase') {
    return camelize(str);
  } else if (namingConvention === 'UPPER_CASE') {
    return upperize(str);
  } else {
    return str;
  }
}

export interface TypeScriptDocumentNodesPluginConfig {
  /**
   * @name namingConvention
   * @type string
   * @default false
   * @description Generates variable names in choosen naming convention (lowerCamelCase or UPPER_CASE)
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    namingConvention: lowerCamelCase
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @name namePrefix
   * @type string
   * @default ''
   * @description Adds prefix to the name
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    namePrefix: 'gql'
   * ```
   */
  namePrefix?: string;
  /**
   * @name nameSuffix
   * @type string
   * @default ''
   * @description Adds suffix to the name
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    nameSuffix: 'Query'
   * ```
   */
  nameSuffix?: string;
}

export const plugin: PluginFunction<TypeScriptDocumentNodesPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptDocumentNodesPluginConfig
): string => {
  const { namingConvention, namePrefix = '', nameSuffix = '' } = config;
  const content = documents
    .filter(documentFile => documentFile.filePath.length > 0)
    .map(documentFile =>
      documentFile.content.definitions
        .filter((d: OperationDefinitionNode) => d.name && d.name.value)
        .map((d: OperationDefinitionNode) => {
          const name = useNamingConvention(namePrefix + d.name.value + nameSuffix, namingConvention);
          const code = print(d)
            .replace(/^/gm, '  ')
            .replace(/\s*$/, '');
          return ['export const ' + name + ': DocumentNode = gql`', code, '`;', ''].join('\n');
        })
        .join('\n')
    )
    .join('\n');

  const prepend = content ? ["import { DocumentNode } from 'graphql';", "import gql from 'graphql-tag';", '', ''] : [];

  return prepend.join('\n') + content;
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (!outputFile.endsWith('.ts')) {
    throw new Error(`Plugin "typescript-document-nodes" requires extension to be ".ts"!`);
  }
};