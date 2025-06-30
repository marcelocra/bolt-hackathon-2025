import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import boltLogo from "./assets/bolt-powered-by_white_circle_360x360.png";

/**
 * Main application component with routing and authentication context
 */

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed top-16 sm:top-4 right-4 z-50 transition-transform hover:scale-105"
            title="Built with Bolt.new"
          >
            <img
              src={boltLogo}
              alt="Built with Bolt.new"
              className="w-20 h-20"
            />
          </a>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
