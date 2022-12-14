import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const darkTheme = createTheme({ palette: { mode: 'dark' } });

const baseUrl: string | undefined =
    document.getElementsByTagName('base')[0].getAttribute('href') || undefined;

root.render(
    <React.StrictMode>
        <BrowserRouter basename={baseUrl}>
            <ThemeProvider theme={darkTheme}>
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
