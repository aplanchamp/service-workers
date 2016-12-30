import React from 'react';
import { render } from 'react-dom';
import { Route, Router, browserHistory, IndexRoute } from 'react-router';
import { Application } from './components/Application/Application';
import Home from './components/container/Home/Home';
import { Page } from './components/container/Page/Page';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch((err) => {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
} else {
  console.log('Service worker not supported');
}


render((
  <Router history={browserHistory} >
    <Route path="/" component={Application}>
      <IndexRoute component={Home} />
      <Route path="/out" component={Page} />
    </Route>
  </Router>
), document.getElementById('root'));
