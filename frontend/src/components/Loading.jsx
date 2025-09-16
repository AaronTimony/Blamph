// Claude generated loading spinner
const cssAnimations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject CSS animations
if (typeof document !== 'undefined' && !document.getElementById('loading-animations')) {
  const style = document.createElement('style');
  style.id = 'loading-animations';
  style.textContent = cssAnimations;
  document.head.appendChild(style);
}

export const SearchLoading = ({detail}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    }}></div>
    <p style={{
      color: '#6b7280',
      fontSize: '18px',
      margin: 0
    }}>{`Loading ${detail}`}</p>
  </div>
);
