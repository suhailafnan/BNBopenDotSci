// FILE: src/App.tsx
// UPDATED FILE: Added 'Explore' to the navigation.

import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { SubmitPaper } from './pages/SubmitPaper';
import { DAO } from './pages/DAO';
import { Explore } from './pages/Explore'; // Import the new page
import { AnimatePresence, motion } from 'framer-motion';

type Page = 'home' | 'submit' | 'dao' | 'explore'; // Add 'explore'

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [activePage, setActivePage] = useState<Page>('home');

  const renderPage = () => {
    switch(activePage) {
        case 'submit':
            return <SubmitPaper />;
        case 'dao':
            return <DAO />;
        case 'explore': // Add case for 'explore'
            return <Explore />;
        case 'home':
        default:
            return (
                <>
                    <div className="container mx-auto py-20 text-center">
                       <h1 className="text-5xl font-bold">Welcome to the Platform</h1>
                       <p className="text-xl text-gray-400 mt-4">Submit your research, vote on grants, and build your on-chain reputation.</p>
                    </div>
                    <HowItWorks />
                </>
            );
    }
  }

  return (
    <Provider store={store}>
      <AnimatePresence>
        {!hasStarted ? (
          <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <LandingHero onGetStarted={() => setHasStarted(true)} />
          </motion.div>
        ) : (
          <motion.div key="main-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div className="bg-gray-900 min-h-screen text-white">
              <Header />
              <nav className="bg-gray-800/30 border-b border-gray-700">
                <div className="container mx-auto flex justify-center space-x-8 py-3">
                    <button onClick={() => setActivePage('home')} className={`px-3 py-1 rounded-md text-sm font-medium ${activePage === 'home' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Home</button>
                    <button onClick={() => setActivePage('explore')} className={`px-3 py-1 rounded-md text-sm font-medium ${activePage === 'explore' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Explore</button>
                    <button onClick={() => setActivePage('submit')} className={`px-3 py-1 rounded-md text-sm font-medium ${activePage === 'submit' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Submit Paper</button>
                    <button onClick={() => setActivePage('dao')} className={`px-3 py-1 rounded-md text-sm font-medium ${activePage === 'dao' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>DAO</button>
                </div>
              </nav>
              <main>
                {renderPage()}
              </main>
              <Footer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Provider>
  );
}

export default App;