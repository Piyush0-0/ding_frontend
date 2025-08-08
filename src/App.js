import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import LandingPage from "./pages/LandingPage";
import PaymentsPage from "./pages/PaymentsPage";
import OrderPage from "./pages/OrderPage";
import CouponsPage from "./pages/CouponsPage";
import OrderGroupView from "./pages/OrderGroupView";
import PaymentsGroupPage from "./pages/PaymentsGroupPage";
import EventsPage from "./pages/EventsPage";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";
import AdminPosOrders from "./pages/AdminPosOrders";

function App() {
  return (
    <Router>
      <Helmet>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-91JJS2MF7T"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-91JJS2MF7T');
          `}
        </script>
      </Helmet>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/payments/:orderId" element={<PaymentsPage />} />
              <Route path="/orders/:orderId" element={<OrderPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
              <Route path="/restaurant/:restaurantId/events" element={<EventsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/order-group/:groupId" element={<OrderGroupView />} />
              <Route path="/payments-group/:groupId" element={<PaymentsGroupPage />} />
              <Route path="/admin/pos-orders" element={<AdminPosOrders />} />
            </Routes>
          </div>
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
