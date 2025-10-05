import "../css/wordSearchReviewPage.css"

export function WordSearchReviewPage({word}) {
  
  return (
    <div className="next-word-box">
      <div className="next-word-card">
        <div className="next-word-content">
          <div className="japanese-next-word-search">{word.jp_word}</div>
        </div>
        <div className="next-word-type">{word.card_type} </div>
        <div className="next-word-information">
          <div className="next-word-rank">Rank: #{word.rank}</div>
          <div className="next-word-deck-appearances">Overall Appearances: {word.overall_frequency}</div>
        </div>
      </div>
    </div>
  )
}
