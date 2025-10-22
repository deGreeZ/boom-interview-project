import { BrowserRouter, Routes, Route } from "react-router-dom";
import PropertySearch from "~/pages/PropertySearch";
import NotFound from "~/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PropertySearch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
