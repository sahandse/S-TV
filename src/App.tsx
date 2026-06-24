import { HashRouter, Routes, Route } from 'react-router-dom';
import { IPTVProvider, useIPTV } from './context/IPTVContext';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Loading from './pages/Loading';
import ErrorPage from './pages/ErrorPage';

function AppRoutes() {
  const { loading, error } = useIPTV();

  if (loading) return <Loading />;
  if (error) return <ErrorPage message={error} />;

  return (
    <div className="min-h-screen bg-[#08080e]">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/countries" element={<Browse mode="all-countries" />} />
          <Route path="/genres" element={<Browse mode="all-genres" />} />
          <Route path="/country/:code" element={<Browse mode="country" />} />
          <Route path="/genre/:id" element={<Browse mode="category" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <IPTVProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </IPTVProvider>
    </HashRouter>
  );
}
