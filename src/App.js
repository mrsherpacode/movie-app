import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// The App comonent is parent of all other components //
// here i'm lifting up state
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [selectedId, setSelectedId] = useState(null);
  // Here, inside the useState i'm using callback function(dose'nt take any arguments) that gets watched movie list from the localStorage which runs only on initial render.
  const [watched, setWatched] = useState(function () {
    // Here, watched means the name of the key in localStorage.
    const watchedMovie = localStorage.getItem("watched");
    // json.parse() converts the string into jason object
    return JSON.parse(watchedMovie);
  });
  ///// API KEY is from this site (https://www.omdbapi.com/)/////
  const KEY = "e9c51d8d";

  // Show movie details //
  function handleMovieDetails(id) {
    // if the movie is already selected then set it to null otherwise set it to id.
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  // close movie details //
  function handleCloseMovie() {
    setSelectedId(null);
  }

  //////////////////////////////////////
  // This function add new movies to the existing movie list
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  /////////////////////////////////////
  //  This function deletes the watched movie from the  movie list
  // The filter method creates a new array that includes only the movies whose imdbID does not match the id passed to the function.
  // This effectively removes the movie with the matching imdbID from the watched list.
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  ////////////////////////////////////////////////////
  //This useEffect will store the watched movie lists into the localStorage and displays it on the user interface on the initial render.
  useEffect(
    function () {
      const storedValue = localStorage.setItem(
        // json.stringigy() converts the object into string.
        "watched",
        JSON.stringify(watched)
      );
      // console.log(storedValue);
    },
    [watched]
  );

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
      handleCloseMovie();
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
          {!isLoading && !error && (
            <MovieList movies={movies} onSelection={handleMovieDetails} />
          )}
          {/* if there is error  */}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleCloseMovie={handleCloseMovie}
              KEY={KEY}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
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
  //Here, i'm creating useRef state.  //
  const inputEl = useRef(null);
  // In order for useRef to work we have  to use useEffect.
  useEffect(
    function () {
      function callback(e) {
        // if the element is already selected just just return
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      //adding keydown(Enter) to callback function.
      document.addEventListener("keydown", callback);
      // cleaning up the keydown event
      return document.addEventListener("keydown", callback);
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      //connecting input element with useRef using ref prop
      ref={inputEl}
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
function MovieList({ movies, selectedId, onSelection }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          selectedId={selectedId}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}
// Movie component //
function Movie({ movie, selectedId, onSelection }) {
  return (
    <li onClick={() => onSelection(movie.imdbID)}>
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

// Movie details component //
function MovieDetails({
  selectedId,
  handleCloseMovie,
  KEY,
  onAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  // Here, i'm deriving  the state
  // checking if it's watched or not
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  // getting userRate
  const userMovieRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  // Destructuring the object
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  //////////////////////////////
  // handle add function
  function handleAdd() {
    const addWatchedMovie = {
      imdbID: selectedId,
      poster,
      title,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(addWatchedMovie);
    handleCloseMovie();
  }

  // This useEffect closes the movie details when the Escape key is pressed.
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          // calling this function closes the movie
          handleCloseMovie();
        }
      }
      // adding keydown eventlistener on callback function.
      document.addEventListener("keydown", callback);
      //This cleanup function removes the addEventlistener after the component has  unmounted or changed
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },

    [handleCloseMovie]
  );

  // This useEffect changes the title of movie in the browser title.
  useEffect(
    function () {
      // if there is no title immediately return.
      if (!title) return;
      document.title = `Movie || ${title}`;
      // This is a useEffect's clean up function which runs after the component has unmounted or the  component has been destroyed.
      return function () {
        document.title = `Movie App`;
      };
    },
    [title]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        console.log(data);

        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &#129056;
            </button>
            <img src={poster} alt={`poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMBD rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to the list
                    </button>
                  )}
                  <p>
                    <em>{plot}</em>
                  </p>
                  <p>Starging : {actors}</p>
                  <p>Directed by : {director} </p>
                </>
              ) : (
                <p>
                  You rated this movie {userMovieRating} <span>⭐</span>
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
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
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
// WatchMovie component
function WatchMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
