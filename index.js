/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import FindPrinter from './src/FindPrinter';
import Print  from './src/Print';

AppRegistry.registerComponent(appName, () => Print);
// AppRegistry.registerComponent(appName, () => FindPrinter);
// AppRegistry.registerComponent(appName, () => App);
