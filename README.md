# graphql-codegen-typescript-document-nodes

<!-- markdownlint-disable MD013 -->

[![Build Status](https://secure.travis-ci.org/dex4er/js-graphql-codegen-typescript-document-nodes.svg)](http://travis-ci.org/dex4er/js-graphql-codegen-typescript-document-nodes) [![npm](https://img.shields.io/npm/v/graphql-codegen-typescript-document-nodes.svg)](https://www.npmjs.com/package/graphql-codegen-typescript-document-nodes)

<!-- markdownlint-enable MD013 -->

This is a plugin for [GraphQL Code
Generator](https://graphql-code-generator.com/) that generates Typescript
source file from GraphQL files.

Generated modules export GraphQL as an AST document nodes. Modules use
[`graphql-tag`](https://www.npmjs.com/package/graphql-tag) module.

## Requirements

This package requires ES6 with Node >= 8.

## Usage

Configuration in `codegen.yml` file:

```yml
overwrite: true
schema: 'schema/index.json'
documents: 'operations/*.graphql'
generates:
  operations/index.ts:
    plugins:
      - graphql-codegen-typescript-document-nodes
    config:
      namingConvention: lowerCamelCase
      nameSuffix: Query
```

With [GitHub GraphQL API v4](https://developer.github.com/v4/) schema and
following GraphQL operation:

```graphql
query Viewer {
  viewer {
    login
    name
  }
}
```

It will generate following Typescript code:

```ts
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export const viewerQuery: DocumentNode = gql`
  query Viewer {
    viewer {
      login
      name
    }
  }
`;
```

## Configuration

### namingConvention

Allow you to override the naming convention of the output. You can either
override all namings, or specify an object with specific custom naming
convention per output. The format of the converter must be a valid
`module#method`. You can also use "keep" to keep all GraphQL names as-is.
Additionally you can set `transformUnderscore` to `true` if you want to
override the default behaviour, which is to preserve underscores.

Override All Names:

```yml
config:
  namingConvention: change-case#lowerCase
```

Upper-case enum values:

```yml
config:
  namingConvention: change-case#pascalCase
```

Keep:

```yml
config:
  namingConvention: keep
```

Transform Underscores:

```yml
config:
  namingConvention: change-case#pascalCase
  transformUnderscore: true
```

### namePrefix

Adds a prefix to GraphQL operation name

### nameSuffix

Adds a suffix to GraphQL operation name

## License

Copyright (c) 2019 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
