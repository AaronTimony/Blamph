import {SORT_OPTIONS} from "../constants/sortOptions"
import "../css/JapaneseWordCards.css"

const JapaneseWordCards = ({ words, deck_name, deckSortMethod, setDeckSortMethod }) => {

  const getKnowledgeClass = (known, level) => {
    if (known) return "knowledge-advanced";
    if (level >= 4) return "knowledge-advanced";
    if (level >= 2) return "knowledge-intermediate";
    return "knowledge-unknown";
  };
  
  const getKnowledgeTier = (known, level) => {
    if (known) return "Known";
    if (level >= 4) return "Advanced";
    if (level >= 2) return "Learning";
    return "beginner";
  };

  const getRankClass = (rank) => {
    if (rank <= 100) return "rank-excellent";
    if (rank <= 1000) return "rank-good";
    if (rank <= 5000) return "rank-average";
    return "rank-low";
  };

  return (
    <div className="deck-word-cards-container">
      <div className="deck-header">
        <h2 className="deck-title-word-details">{deck_name}</h2>
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={deckSortMethod} 
            onChange={(e) => setDeckSortMethod(e.target.value)}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {words.map((word, index) => (
        console.log(word),
        <div key={index} className="deck-word-card">
          {/* Main content area */}
          <div className="card-content-word">
            <div className="word-section">
              <h3 className="jp-word">{word.jp_word}{word.reading ? ` (${word.reading})` : ``}</h3>
              <p className="meaning">{word.meaning[0]}</p>
            </div>

            {/* Knowledge status - Top right */}
            <div className={`knowledge-status ${getKnowledgeClass(word.known, word.level)}`}>
              <div className="knowledge-info">
                <span>{getKnowledgeTier(word.known, word.level)}</span>
                {
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i}
                        className={`star ${i < word.level ? 'filled' : 'empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="card-footer">
            {/* Word frequency - Bottom left */}
            <div className="frequency-info">
              <span className="label">Deck Frequency:</span>
              <span className="frequency-value">{word.word_frequency}</span>
            </div>

            {/* Overall rank - Bottom right */}
            <div className="rank-info">
              <span className="label">Overall Rank:</span>
              <span className={`rank-value ${getRankClass(word.overall_rank)}`}>
                #{word.overall_rank}
              </span>
            </div>
          </div>

          {/* Decorative element */}
          <div className="card-accent"></div>
        </div>
      ))}
    </div>
  );
};

export default JapaneseWordCards;
