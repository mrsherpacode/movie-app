import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
// import App from "./App";

import "./index.css";
import App from "./App";
////////////////////////////////////////////////////////////////////
///////////// This is for the StarRating.js file /////////////////////////
// import StarRating from "./StarRating";
// import { useState } from "react";

// function Test() {
//   // const [movieRated, setMovieRated] = useState(0);
//   return (
//     <div>
//       {/* <StarRating color="green" maxRating={10} onSetRating={setMovieRated} /> */}
//       {/* <p>This movie was rated {movieRated} star.</p> */}
//     </div>
//   );
// }
//////////////////////////////////////////////////////////////////////////

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* This commented part is for the starRating.js file  */}
    {/* <StarRating
      maxRating={5}
      messages={["terrible", "bad", "ok", "good", "amazing"]}
    />
    <StarRating color="red" size={20} defaultRating={2} /> */}
    {/* <Test /> */}
    {/* <Apps /> */}
  </React.StrictMode>
);
