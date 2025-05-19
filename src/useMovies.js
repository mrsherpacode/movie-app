import { useState, useEffect } from "react";
//Here, i'm creating a custom hook called useMovies  to extract some functionality of App component.
export function useMovies(query) {
  ///// API KEY is from this site (https://www.omdbapi.com/)/////
  const KEY = "e9c51d8d";
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  //  here, i'm using useEffect hook here
  // The function inside useEffect is executed after the component renders for the first time (on mount).
  // It fetches data from the OMDB API using the fetch function.
  useEffect(
    function () {
      //  This native browser API cancel the fetch request.
      const controller = new AbortController();
      async function moviesData() {
        try {
          // this API link is from this site (https://www.omdbapi.com/)
          // this shows loading spinner on the screen before the movie data is fetched.
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            //this seconds argument connects with asynchronous operation.
            { signal: controller.signal }
          );
          //Throwing error when there is problem when fetching data.
          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          //  Throwing error if the search do not matches the search movies
          if (data.Response === "False") throw new Error("movies not found ");
          setMovies(data.Search);
          setError("");
          console.log(data.Search);
          // setIsLoading is false once the data is fetched.
        } catch (err) {
          // for catching error.
          // console.error(err.message);
          // this ignores the abortError error.
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          // finally exicute the code
          setIsLoading(false);
        }
      }

      // if the search queries is less then three words then  make setMovies empty
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      //close the movie details when the other name is typed in search button.
      //   handleCloseMovie();
      // Here, i'm calling moviesData function because its inside another function.
      moviesData();
      // this cancels the fetch request
      return function () {
        controller.abort();
      };
    },
    //Here, the query state is a  depedency array and every time this state changes the useEffect hook will execute and re-render the query result.
    [query]
  );

  //returning object
  return { movies, isLoading, error };
}
