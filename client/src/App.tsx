// FILE: src/App.tsx
// This is your main App component. It provides the Redux store and renders the Header.

import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Header } from './components/Header';

function App() {
  return (
    <Provider store={store}>
      <div className="bg-gray-900 min-h-screen text-white">
        <Header />
        <main className="flex items-center justify-center pt-20">
          <h1 className="text-5xl font-bold text-center">
            The Future of Science is Decentralized.
          </h1>
        </main>
      </div>
    </Provider>
  );
}

export default App;
