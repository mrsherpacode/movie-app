import { useEffect, useState } from "react";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// The App comonent is parent of all other components //
///// API KEY is from this site (https://www.omdbapi.com/)/////
// here i'm lifting up state
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const KEY = "e9c51d8d";

  //  here, i'm using useEffect hook here
  // The function inside useEffect is executed after the component renders for the first time (on mount).
  // It fetches data from the OMDB API using the fetch function.
  useEffect(
    function () {
      async function moviesData() {
        try {
          // this API link is from this site (https://www.omdbapi.com/)
          // this shows loading spinner on the screen before the movie data is fetched.
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          //Throwing error when there is problem when fetching data.
          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          //  Throwing error if the search do not matches the search movies
          if (data.Response === "False") throw new Error("movies not found ");
          setMovies(data.Search);
          // console.log(data.Search);
          // setIsLoading is false once the data is fetched.
        } catch (err) {
          // for catching error.
          console.error(err.message);
          setError(err.message);
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
      // Here, i'm calling moviesData function because its inside another function.
      moviesData();
    },
    //Here, the query state is a  depedency array and every time this state changes the useEffect hook will execute and re-render the query result.
    [query]
  );
  return (
    <>
      {/* logo, search, NumResults are childrens  of NavBar. */}
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {/* if the movie data is loading  */}
          {isLoading && <Loader />}
          {/* if the response is not loading and there is no error  */}
          {!isLoading && !error && <MovieList movies={movies} />}
          {/* if there is error  */}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </Box>

        {/* 
        can also be done this way, direct or explict prop component composition
        <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          } */}
      </Main>
    </>
  );
}

// Loader component that loads on the screen before the movie data is fetched.
function Loader() {
  return <p className="loader">loading...</p>;
}

//  Error message
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  );
}
// Spliting a large component into small components //
// navBar component //
//component composition to avoid prop drilling by using children prop.
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Logo component//s
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
//Search component //
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
// NumResults Component //
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// Main component //
function Main({ children }) {
  return <main className="main">{children}</main>;
}
//Box component //
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// MovieList component //
function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
// Movie component //
function Movie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// WatchedSummary component //
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

// WatchedMovieList Component
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
// WatchMovie component
function WatchMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
