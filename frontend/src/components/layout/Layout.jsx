// src/components/layout/Layout.jsx
import Header from './Header';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default Layout;