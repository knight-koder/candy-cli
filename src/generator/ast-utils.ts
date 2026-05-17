import { Project, QuoteKind, SyntaxKind } from 'ts-morph';
import path from 'path';

import { 
  APP_MODULE_FILE, 
  APP_MODULE_CLASS 
} from '../constants/index.js';

export interface ModuleInjection {
  moduleName: string;
  importPath: string;
}

export async function injectModuleToAppModule(
  projectDir: string,
  injection: ModuleInjection
): Promise<void> {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
    },
  });

  const appModulePath = path.join(projectDir, APP_MODULE_FILE);
  const sourceFile = project.addSourceFileAtPath(appModulePath);

  const classDeclaration = sourceFile.getClass(APP_MODULE_CLASS);
  if (!classDeclaration) {
    throw new Error(`Could not find ${APP_MODULE_CLASS} class in ${APP_MODULE_FILE}`);
  }

  const moduleDecorator = classDeclaration.getDecorator('Module');
  if (!moduleDecorator) {
    throw new Error('Could not find @Module decorator on AppModule class');
  }

  const decoratorArg = moduleDecorator.getArguments()[0];
  if (!decoratorArg || !decoratorArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
    throw new Error('@Module decorator must have an object literal argument');
  }

  const obj = decoratorArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const importsProp = obj.getProperty('imports');

  if (!importsProp) {
    obj.addPropertyAssignment({
      name: 'imports',
      initializer: `[${injection.moduleName}]`,
    });
  } else if (importsProp.isKind(SyntaxKind.PropertyAssignment)) {
    const initializer = importsProp.getInitializer();
    if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      const arrayLiteral = initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
      const exists = arrayLiteral.getElements().some(e => e.getText() === injection.moduleName);
      if (!exists) {
        arrayLiteral.addElement(injection.moduleName);
      }
    }
  }

  // Add import statement
  const existingImport = sourceFile.getImportDeclaration(i => i.getModuleSpecifierValue() === injection.importPath);
  if (!existingImport) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: injection.importPath,
      namedImports: [injection.moduleName],
    });
  }

  sourceFile.formatText();
  await project.save();
}
