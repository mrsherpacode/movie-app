import { useEffect } from "react";
// This re-useable custom hook extracts the functionality of enter and escape key for focusing the search element and removing the movie component.
export function useKey(key, action) {
  // This useEffect  closes the movie details when the Escape key is pressed.
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          // calling this function closes the movie
          action();
        }
      }
      // adding keydown eventlistener on callback function.
      document.addEventListener("keydown", callback);
      //This cleanup function removes the addEventlistener after the component has  unmounted or changed
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },

    [action, key]
  );
}
