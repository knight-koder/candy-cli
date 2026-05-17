import type { FeatureConfig } from './types.js';
import { PATHS, PROTOCOLS, FEATURE_NAMES } from '../constants/index.js';
import { getRelativeImportPath } from './utils.js';

export const restFeature: FeatureConfig = {
  name: FEATURE_NAMES.REST,
  condition: (a) => a.protocols.includes(PROTOCOLS.REST),
  files: () => [
    { src: 'modules/rest/app.controller.ts.ejs', dest: 'src/app.controller.ts', type: 'render' },
  ],
};

export const graphqlFeature: FeatureConfig = {
  name: FEATURE_NAMES.GRAPHQL,
  condition: (a) => a.protocols.includes(PROTOCOLS.GRAPHQL),
  dependencies: ['@nestjs/graphql', '@nestjs/apollo', '@apollo/server', 'graphql', '@as-integrations/express5'],
  files: () => [
    { src: 'modules/graphql/app.resolver.ts.ejs', dest: `${PATHS.GRAPHQL}/app.resolver.ts`, type: 'render' },
    { src: 'modules/graphql/graphql.module.ts.ejs', dest: `${PATHS.GRAPHQL}/graphql.module.ts`, type: 'render' },
    { src: 'modules/graphql/app.resolver.spec.ts.ejs', dest: `${PATHS.GRAPHQL}/app.resolver.spec.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'GraphqlModule', 
    importPath: () => `${getRelativeImportPath(PATHS.GRAPHQL)}/graphql.module` 
  },
};

export const grpcFeature: FeatureConfig = {
  name: FEATURE_NAMES.GRPC,
  condition: (a) => a.protocols.includes(PROTOCOLS.GRPC),
  dependencies: ['@nestjs/microservices', '@grpc/grpc-js', '@grpc/proto-loader', 'rxjs'],
  devDependencies: ['@types/google-protobuf'],
  files: () => [
    { src: 'modules/grpc/grpc.module.ts.ejs', dest: `${PATHS.GRPC}/grpc.module.ts`, type: 'render' },
    { src: 'modules/grpc/hero.proto.ejs', dest: `${PATHS.GRPC}/hero/hero.proto`, type: 'render' },
    { src: 'modules/grpc/grpc.controller.ts.ejs', dest: `${PATHS.GRPC}/grpc.controller.ts`, type: 'render' },
    { src: 'modules/grpc/grpc.controller.spec.ts.ejs', dest: `${PATHS.GRPC}/grpc.controller.spec.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'GrpcClientModule', 
    importPath: () => `${getRelativeImportPath(PATHS.GRPC)}/grpc.module` 
  },
};

export const websocketsFeature: FeatureConfig = {
  name: FEATURE_NAMES.WEBSOCKETS,
  condition: (a) => a.protocols.includes(PROTOCOLS.WEBSOCKETS),
  dependencies: ['@nestjs/websockets', '@nestjs/platform-socket.io', 'socket.io'],
  files: () => [
    { src: 'modules/websockets/app.gateway.ts.ejs', dest: `${PATHS.WEBSOCKETS}/app.gateway.ts`, type: 'render' },
    { src: 'modules/websockets/websockets.module.ts.ejs', dest: `${PATHS.WEBSOCKETS}/websockets.module.ts`, type: 'render' },
    { src: 'modules/websockets/app.gateway.spec.ts.ejs', dest: `${PATHS.WEBSOCKETS}/app.gateway.spec.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'WebSocketsModule', 
    importPath: () => `${getRelativeImportPath(PATHS.WEBSOCKETS)}/websockets.module` 
  },
};
