import { BrowserRouter, Routes, Route } from "react-router-dom";
import PropertySearch from "~/pages/PropertySearch";
import NotFound from "~/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PropertySearch />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
