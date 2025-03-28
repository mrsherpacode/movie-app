import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import Apps from "./Expander";

// import "./index.css";
// import App from "./App";
import StarRating from "./StarRating";
import { useState } from "react";

// function Test() {
//   const [movieRated, setMovieRated] = useState(0);
//   return (
//     <div>
//       <StarRating color="green" maxRating={10} onSetRating={setMovieRated} />
//       <p>This movie was rated {movieRated} star.</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App />
    <StarRating
      maxRating={5}
      messages={["terrible", "bad", "ok", "good", "amazing"]}
    />
    <StarRating color="red" size={20} defaultRating={2} />
    <Test /> */}
    <Apps />
  </React.StrictMode>
);
