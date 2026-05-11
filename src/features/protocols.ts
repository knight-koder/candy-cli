import type { FeatureConfig } from './types.js';

export const restFeature: FeatureConfig = {
  name: 'REST',
  condition: (a) => a.protocols.includes('REST'),
  files: () => [
    { src: 'modules/rest/app.controller.ts.ejs', dest: 'src/app.controller.ts', type: 'render' },
  ],
};

export const graphqlFeature: FeatureConfig = {
  name: 'GraphQL',
  condition: (a) => a.protocols.includes('GraphQL'),
  dependencies: ['@nestjs/graphql', '@nestjs/apollo', '@apollo/server', 'graphql', '@as-integrations/express5'],
  files: () => [
    { src: 'modules/graphql/app.resolver.ts.ejs', dest: 'src/graphql/app.resolver.ts', type: 'render' },
    { src: 'modules/graphql/graphql.module.ts.ejs', dest: 'src/graphql/graphql.module.ts', type: 'render' },
    { src: 'modules/graphql/app.resolver.spec.ts.ejs', dest: 'src/graphql/app.resolver.spec.ts', type: 'render' },
  ],
  injection: { moduleName: 'GraphqlModule', importPath: './graphql/graphql.module' },
};

export const grpcFeature: FeatureConfig = {
  name: 'gRPC',
  condition: (a) => a.protocols.includes('gRPC'),
  dependencies: ['@nestjs/microservices', '@grpc/grpc-js', '@grpc/proto-loader', 'rxjs'],
  devDependencies: ['@types/google-protobuf'],
  files: () => [
    { src: 'modules/grpc/grpc.module.ts.ejs', dest: 'src/grpc/grpc.module.ts', type: 'render' },
    { src: 'modules/grpc/hero.proto.ejs', dest: 'src/grpc/hero/hero.proto', type: 'render' },
    { src: 'modules/grpc/grpc.controller.ts.ejs', dest: 'src/grpc/grpc.controller.ts', type: 'render' },
    { src: 'modules/grpc/grpc.controller.spec.ts.ejs', dest: 'src/grpc/grpc.controller.spec.ts', type: 'render' },
  ],
  injection: { moduleName: 'GrpcClientModule', importPath: './grpc/grpc.module' },
};

export const websocketsFeature: FeatureConfig = {
  name: 'WebSockets',
  condition: (a) => a.protocols.includes('WebSockets'),
  dependencies: ['@nestjs/websockets', '@nestjs/platform-socket.io', 'socket.io'],
  files: () => [
    { src: 'modules/websockets/app.gateway.ts.ejs', dest: 'src/websockets/app.gateway.ts', type: 'render' },
    { src: 'modules/websockets/websockets.module.ts.ejs', dest: 'src/websockets/websockets.module.ts', type: 'render' },
    { src: 'modules/websockets/app.gateway.spec.ts.ejs', dest: 'src/websockets/app.gateway.spec.ts', type: 'render' },
  ],
  injection: { moduleName: 'WebSocketsModule', importPath: './websockets/websockets.module' },
};
