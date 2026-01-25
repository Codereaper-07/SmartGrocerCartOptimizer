import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
         <a
          className="flex items-center gap-5 text-2xl font-bold leading-none hover:text-blue-200 transition-colors"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <img
             src="/logo.png"
             alt="Smart Grocery Cart Optimizer Logo"
             className="h-28 w-28 object-contain translate-y-[8px]"
          />
          <span className="flex items-center">
            Smart Grocery Cart
          </span>
        </a>





          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  Login
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                >
                  Register
                </a>
              </>
            ) : (
              <>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/products"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/products');
                  }}
                >
                  Products
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/cart"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cart');
                  }}
                >
                  Cart
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/optimize"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/optimize');
                  }}
                >
                  Optimize
                </a>
                <button
                  className="ml-2 px-4 py-2 border border-white rounded hover:bg-blue-700 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {!isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                >
                  Register
                </a>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/products"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/products');
                    setIsMenuOpen(false);
                  }}
                >
                  Products
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/cart"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/cart');
                    setIsMenuOpen(false);
                  }}
                >
                  Cart
                </a>
                <a
                  className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                  href="/optimize"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/optimize');
                    setIsMenuOpen(false);
                  }}
                >
                  Optimize
                </a>
                <button
                  className="px-3 py-2 border border-white rounded hover:bg-blue-700 transition-colors text-left"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
