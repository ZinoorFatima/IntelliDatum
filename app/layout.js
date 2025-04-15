// app/layout.js
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import { AuthProvider } from "./context/auth";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <AuthProvider>
          <Header />
          <main className="flex-fill">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
