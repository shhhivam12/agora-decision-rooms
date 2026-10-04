import { readFileSync } from 'fs';
import { resolve } from 'path';
import { name as appName } from '../app.json';

// Component tests render App directly and miss a mismatched native launcher.
// Check the actual entrypoints before producing an installable build.
describe('native launch registration', () => {
  it('launches the component registered by index.js on Android', () => {
    const activity = readFileSync(
      resolve(
        __dirname,
        '../android/app/src/main/java/com/rnquickstart/MainActivity.kt',
      ),
      'utf8',
    );
    const component = activity.match(
      /getMainComponentName\(\):\s*String\s*=\s*"([^"]+)"/,
    );
    expect(component?.[1]).toBe(appName);
  });

  it('launches the registered component on iOS', () => {
    const delegate = readFileSync(
      resolve(__dirname, '../ios/RnQuickstart/AppDelegate.swift'),
      'utf8',
    );
    const component = delegate.match(/withModuleName:\s*"([^"]+)"/);
    expect(component?.[1]).toBe(appName);
  });

  it('registers the app.json component name in the JavaScript entrypoint', () => {
    const entrypoint = readFileSync(resolve(__dirname, '../index.js'), 'utf8');
    expect(entrypoint).toMatch(
      /import\s*\{\s*name as appName\s*\}\s*from\s*['"]\.\/app\.json['"]/,
    );
    expect(entrypoint).toMatch(/AppRegistry\.registerComponent\(appName,/);
  });
});
