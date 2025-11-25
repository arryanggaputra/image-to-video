import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import {
  HomePage,
  AboutPage,
  ProductsPage,
  EditProductPage,
  NotFoundPage,
} from "./pages";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products/:domainId" element={<ProductsPage />} />
          <Route
            path="/product/:productId/edit"
            element={<EditProductPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
