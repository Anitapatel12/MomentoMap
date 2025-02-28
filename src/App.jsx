import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Map from "./components/Map";
import SignIn from "./components/SignIn";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Map />} /> {/* Ensure this is the correct path */}
    </Routes>
  );
}

export default App;
