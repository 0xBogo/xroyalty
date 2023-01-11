import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Header from "./layout/Header";
import './sass/styles.scss';
import { XummProvider } from 'xumm-react';
import View from './pages/View';

function App() {

  return (
    // <XummProvider config={}>
    <div id="app">
      <Header />
      <Routes>
        <Route index element={<Home />} />
        <Route path="view" element={<View />} />
      </Routes>
    </div>
    // </XummProvider>
  );
}

export default App;
