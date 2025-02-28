import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';

// ✅ Use Only the Clerk Publishable Key (Remove Secret Key)
const clerkPubKey = "pk_test_ZnVubnktYmVldGxlLTIxLmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter> {/* ✅ Only one BrowserRouter */}
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </ClerkProvider>
);
