import { createRoot } from 'react-dom/client';
import { Main } from './main';
import './index.css'
import { BrowserRouter } from 'react-router';

const container = document.querySelector('#root') as Element;
const root = createRoot(container);

root.render(
    <BrowserRouter>
        <Main />
    </BrowserRouter>
);
