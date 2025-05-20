import { useState, useEffect } from "react";

// This is a re-useable custom hook. //
export function useLocalStorage(initialRender, key) {
  // Here, inside the useState i'm using callback function(dose'nt take any arguments) that gets watched movie list from the localStorage which runs only on initial render.
  const [value, setValue] = useState(function () {
    // Here, key means the name of the key in localStorage.
    const watchedMovie = localStorage.getItem(key);
    // json.parse() converts the string into jason object
    return watchedMovie ? JSON.parse(watchedMovie) : initialRender;
  });

  ////////////////////////////////////////////////////
  //This useEffect will store the watched movie lists into the localStorage and displays it on the user interface on the initial render.
  useEffect(
    function () {
      const storedValue = localStorage.setItem(
        // json.stringigy() converts the object into string.
        key,
        JSON.stringify(value)
      );
      // console.log(storedValue);
    },
    [value, key]
  );
  return [value, setValue];
}
