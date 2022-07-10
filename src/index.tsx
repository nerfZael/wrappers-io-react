import React from 'react';
import ReactDOM from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Config, DAppProvider, Mainnet, Rinkeby, Ropsten, Polygon, Localhost } from '@usedapp/core';
import 'react-app-polyfill/stable';
import 'react-app-polyfill/ie11';
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-nan';

const usedappConfig: Config = {
  autoConnect: true,
  networks: [Mainnet, Rinkeby, Ropsten, Polygon, Localhost],
  multicallAddresses: {
    [Localhost.chainId]: "0x0000000000000000000000000000000000000000",
  }
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={usedappConfig}>
      <App />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
