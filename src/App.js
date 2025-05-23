import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocaleStorage";
import { useKey } from "./useKey";
const KEY = "e9c51d8d";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// The App comonent is parent of all other components //
// here i'm lifting up state
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  //  Here, i'm calling a custom hook called useMovies from useMovies.js file. and destructured the return objects.
  const { movies, isLoading, error } = useMovies(query);

  // Here, i'm calling the custom hook called useLocalStorage()
  const [watched, setWatched] = useLocalStorage([], "watched");

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
  // Here, i'm calling  a re-useable custom hook called useKey()
  useKey("Enter", function () {
    // if the element is already selected just just return
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

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

  // This useRef counts the total number that a user clicks the userRating star.
  const countRef = useRef(0);
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );
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
      //countRatingDecision does'nt show on the user interface.
      countRatignDecision: countRef.current,
    };

    onAddWatched(addWatchedMovie);
    handleCloseMovie();
  }

  //  Here, i'm calling a re-useable custom hook called useKey() that closes the movie details when the Escape key is pressed.
  useKey("Escape", handleCloseMovie);

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
