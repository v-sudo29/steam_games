import { useEffect, useState, useRef } from 'react'
import Card from './components/Card';
import './App.css';

function App() {
  const [gamesData, setGamesData] = useState(null)
  const [currentResults, setCurrentResults] = useState(null)
  const [gameCards, setGameCards] = useState(null)
  const [genres, setGenres] = useState([])
  const [sortList, setSortList] = useState([])

  const searchValue = useRef(null)
  const genreFilters = useRef([
    'Base Building',
    'Colony Sim',
    'Farming Sim',
    'Indie',
    'Life Sim',
    'Pixel Graphics',
    '2D',
  ])
  const sortFilters = useRef([
    'Discount',
    'Current Price',
    'Rating',
    'Feedback',
  ])

  // FUNCTION: set default cards 
  function setDefaultCards() {
    setGameCards(gamesData.map(game => {
      const genreTags = game.genres.map(genre => {
        return (
          <div key={`${game.appId+genre}`} className='genre-tag'>
            {genre}
          </div>
        )
      })
      return (
        <Card
          key={game.appId}
          appId={game.appId}
          name={game.name}
          imgUrl={game.imgUrl}
          discount={game.discount}
          originalPrice={game.originalPrice}
          currentPrice={game.currentPrice}
          rating={game.rating}
          reviewsType={game.reviewsType}
          genreTags={genreTags}
        />
      )
    }))
    setCurrentResults(gamesData)
  }

  // FUNCTION: Handle sort click
  function handleSortClick(e) {
    const currentSort = e.target.innerText

    // Add class
    if (e.target.classList.contains('sort-active')) {
      e.target.classList.remove('sort-active')
      setSortList(prevSorts => {
        return prevSorts.filter(sort => sort !== currentSort ? sort : null)
      })
    } else {
      e.target.classList.add('sort-active')

      if (sortList.length === 0) {
        setSortList([currentSort])
      } else {
        setSortList(prevSorts => [...prevSorts, currentSort])
      }
    }
  }

  // FUNCTION: HANDLE SEARCH BUTTON
  function handleSearch() {
    console.log(searchValue.current.value)
  }

  // FUNCTION: HANDLE GENRE CLICK
  function handleGenreClick(e) {
    const currentGenre = e.target.innerText

    if (e.target.classList.contains('genre-active')) {
      e.target.classList.remove('genre-active')
      setGenres(prevGenres => {
        return prevGenres.filter(genre => genre !== currentGenre ? genre : null)
      })
    } 
    
    else {
      e.target.classList.add('genre-active')

      if (genres.length === 0) {
        setGenres([currentGenre])
      } else {
        setGenres(prevGenres => [...prevGenres, currentGenre])
      }
    }
  }

  // FETCH SERVER DATA
  useEffect(() => {
    fetch('https://steam-games-server.onrender.com/')
      .then(res => res.json())
      .then(data => {

        // Filter out data that don't have genres property
        const newData = data.filter(game => game.genres ? game : null)
        setGamesData(newData)
        setCurrentResults(newData)
      })
  }, [])

  // SET DEFAULT GAME CARDS IF GENRES AND SORT EMPTY
  useEffect(() => {
    if (currentResults !== null && genres.length === 0) {
      setDefaultCards()
    } 
  }, [gamesData, genres, sortList])

  // SET NEW GAME CARDS BY GENRES AND SORT
  useEffect(() => {

    // SET BY GENRES ONLY
    if (genres.length !== 0 && gamesData !== null && sortList.length === 0) {
      const matchedGames = []
      const gamesDataCopy = [...gamesData]
      
      for (let i = 0; i < gamesDataCopy.length; i++) {
        const genreExists = gamesDataCopy[i]['genres'].some(genre => genres.includes(genre))
        if (genreExists) {
          matchedGames.push(gamesDataCopy[i])
        } 
      }

      setGameCards(matchedGames.map(game => {
        const gameGenres = game.genres ? game.genres : []
        const genreTags = gameGenres.map(genre => {
          return (
            <div key={`${game.appId+genre}`} className='genre-tag'>
              {genre}
            </div>
          )
        })
        return (
          <Card 
            key={game.appId}
            appId={game.appId}
            name={game.name}
            imgUrl={game.imgUrl}
            discount={game.discount}
            originalPrice={game.originalPrice}
            currentPrice={game.currentPrice}
            rating={game.rating}
            reviewsType={game.reviewsType}
            genreTags={genreTags}
          />
        )
      }))
      setCurrentResults(matchedGames)
    } 
    
    // SET BY SORT ONLY
    else if (genres.length === 0 && gamesData !== null && sortList.length !== 0) {
      const currentResultsCopy = [...gamesData]

      // Sort through all sort types
      if (sortList.includes('Discount')) {
        const sortedResults = currentResultsCopy.sort((a, b) => {
          const newA = a.discount.replace(/-/g, '').replace(/%/g, '')
          const newB = b.discount.replace(/-/g, '').replace(/%/g, '')

          if (newA > newB) {
            return -1
          } else if (newB > newA) {
            return 1
          } else {
            return 0
          }
        })

        setCurrentResults(sortedResults)
        setGameCards(sortedResults.map(game => {
          const genreTags = game.genres.map(genre => {
            return (
              <div key={`${game.appId+genre}`} className='genre-tag'>
                {genre}
              </div>
            )
          })
          return (
            <Card 
              key={game.appId}
              appId={game.appId}
              name={game.name}
              imgUrl={game.imgUrl}
              discount={game.discount}
              originalPrice={game.originalPrice}
              currentPrice={game.currentPrice}
              rating={game.rating}
              reviewsType={game.reviewsType}
              genreTags={genreTags}
            />
          )
        }))
      } 
    }

    // SET BY GENRES AND SORT
    else if (genres.length !== 0 && gamesData !== null && sortList.length !== 0) {
      console.log('activated')
      const matchedGames = []
      const gamesDataCopy = [...currentResults]
      const genresCopy = [...genres]
      let sortedResults = null

      // FILTER BY GENRES
      for (let i = 0; i < gamesDataCopy.length; i++) {
        const genreExists = gamesDataCopy[i]['genres'].some(genre => genresCopy.includes(genre))
        if (genreExists) {
          matchedGames.push(gamesDataCopy[i])
        } 
      }

      // SORT BY SORT TYPE
      if (sortList.includes('Discount')) {
        sortedResults = matchedGames.sort((a, b) => {
          const newA = a.discount.replace(/-/g, '').replace(/%/g, '')
          const newB = b.discount.replace(/-/g, '').replace(/%/g, '')

          if (newA > newB) {
            return -1
          } else if (newB > newA) {
            return 1
          } else {
            return 0
          }
        }) 
      }
      console.log(sortedResults)

      setCurrentResults(sortedResults)
      setGameCards(sortedResults.map(game => {
        const genreTags = game.genres.map(genre => {
          return (
            <div key={`${game.appId+genre}`} className='genre-tag'>
              {genre}
            </div>
          )
        })
        return (
          <Card 
            key={game.appId}
            appId={game.appId}
            name={game.name}
            imgUrl={game.imgUrl}
            discount={game.discount}
            originalPrice={game.originalPrice}
            currentPrice={game.currentPrice}
            rating={game.rating}
            reviewsType={game.reviewsType}
            genreTags={genreTags}
          />
        )
      }))
    }


  }, [genres, sortList])

  // SET GENRE FILTER TAGS
  const genreTags = genreFilters.current.map(genre => {
    return (
      <button 
        key={`${genre}-search-genre-tag`} 
        type='button'
        className='search-genre-tag'
        onClick={handleGenreClick}
      >{genre}
      </button>
    )
  })

  // SET SORTING TAGS
  const sortingTags = sortFilters.current.map(sort => {
    return (
      <button
        key={sort}
        type='button'
        className='sorting-tag'
        onClick={(e) => handleSortClick(e)}
      >{sort}
      </button>
    )
  })

  return (
    <div className="App">
      <div className='search-bar'>
        <input ref={searchValue} type="text" placeholder='Search'/>
        <button onClick={handleSearch} type="button">Search</button>
      </div>
      <div className='sorting-container'>
        {sortingTags}
      </div>
      <div className='genre-filter-container'>
        {genreTags}
      </div>
      <div className='search-results'>
        {gamesData === null ? <h1>...Loading</h1> : <>{gameCards}</>}
      </div>
    </div>
  );
}

export default App;
