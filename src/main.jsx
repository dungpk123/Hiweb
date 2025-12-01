import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import store from "./core/redux/store.jsx";
import AllRoutes from "./Router/router.jsx";
import { base_path } from "./environment.jsx";

// Import environment config (for backward compatibility)
import './config/env.js';

// Import i18n config
import './i18n/config';

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import './style/css/feather.css';
import './style/css/line-awesome.min.css';
import "./style/scss/main.scss";
import './style/icons/fontawesome/css/fontawesome.min.css';
import './style/icons/fontawesome/css/all.min.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter basename={base_path}>
          <AllRoutes />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Element with id 'root' not found.");
}
