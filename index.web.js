import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
if (module.hot) {
  module.hot.accept();
}
const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
AppRegistry.registerComponent(appName, () => Root);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('app-root'),
});
