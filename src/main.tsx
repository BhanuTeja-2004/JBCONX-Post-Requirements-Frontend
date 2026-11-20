import { createRoot } from 'react-dom/client';
import App from './App';
import { cssVariables } from './theme/tokens';
import './theme/styles.css';

const style = document.createElement('style');
style.textContent = cssVariables();
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(<App />);
