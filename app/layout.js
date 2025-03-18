// app/layout.js
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/auth";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>
          <Header />
          <main>{children}</main>
          <Footer />
        </body>
      </AuthProvider>
    </html>
  );
}
