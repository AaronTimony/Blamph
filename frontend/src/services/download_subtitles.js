async function downloadSubtitleWithHeader(fileId) {
    const access_token = localStorage.getItem('access_token');
    
    if (!jwtToken) {
        throw new Error('No JWT token found. Please authenticate first.');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/words/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file_id: fileId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Processing failed:', error);
    }
}
