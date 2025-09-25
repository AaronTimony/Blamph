import "../css/wordSearchRes.css"

export function WordSearch({words, addWordToPriorityQueue}) {
  const wordsArray = Object.values(words)
  
  return (
    <div className="search-results-boxes">
      <div className="search-results-container">
        {wordsArray.map((word, index) => (
          <div key={index} className="word-card">
            <div className="word-header">
              <span className="word-rank">#{word.rank}</span>
              <span className="word-frequency">{word.overall_frequency} freq</span>
            </div>
            <div className="word-content">
              <div className="japanese-word-search">{word.jp_word}</div>
              <div className="word-meaning">{word.meaning}</div>
            </div>
            <div className="add-word-to-new">
              <button onClick={() => {addWordToPriorityQueue.mutate(word.card_id)}} className="add-to-new-queue-button">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
