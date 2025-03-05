import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';

const clerkPubKey = "pk_test_ZnVubnktYmVldGxlLTIxLmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </ClerkProvider>
);
