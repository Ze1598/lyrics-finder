document.addEventListener('DOMContentLoaded', () => {
    const lyricsInput = document.getElementById('lyrics-input');
    const searchButton = document.getElementById('search-button');
    const loadingElement = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    const apiKeyMessage = document.getElementById('api-key-message');
    
    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        loadingElement.classList.add('hidden');
    }
    
    // Function to clear error message
    function clearError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }
    
    // Function to create a song card
    function createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        
        let thumbnailHtml = '';
        if (song.thumbnail) {
            thumbnailHtml = `<img src="${song.thumbnail}" alt="${song.title} by ${song.artist}" class="song-thumbnail">`;
        } else {
            thumbnailHtml = `<div class="song-thumbnail" style="background-color: #ddd; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 3rem; color: #999;">🎵</span>
                             </div>`;
        }
        
        card.innerHTML = `
            ${thumbnailHtml}
            <div class="song-info">
                <h3 class="song-title">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <a href="${song.url}" target="_blank" class="song-link">View on Genius</a>
            </div>
        `;
        
        return card;
    }
    
    // Function to search for songs
    async function searchSongs(lyrics) {
        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lyrics })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to search for songs');
            }
            
            if (data.error && (data.error.includes('API key not configured') || data.error.includes('access token not configured'))) {
                apiKeyMessage.classList.remove('hidden');
                resultsContainer.classList.add('hidden');
                return;
            }
            
            return data.songs;
        } catch (error) {
            throw error;
        }
    }
    
    // Event listener for search button
    searchButton.addEventListener('click', async () => {
        const lyrics = lyricsInput.value.trim();
        
        if (!lyrics) {
            showError('Please enter some lyrics to search for.');
            return;
        }
        
        // Clear previous results and errors
        clearError();
        resultsList.innerHTML = '';
        resultsContainer.classList.add('hidden');
        apiKeyMessage.classList.add('hidden');
        
        // Show loading indicator
        loadingElement.classList.remove('hidden');
        
        try {
            const songs = await searchSongs(lyrics);
            
            // Hide loading indicator
            loadingElement.classList.add('hidden');
            
            if (songs && songs.length > 0) {
                // Display results
                songs.forEach(song => {
                    resultsList.appendChild(createSongCard(song));
                });
                
                resultsContainer.classList.remove('hidden');
            } else {
                showError('No songs found matching those lyrics. Try a different search.');
            }
        } catch (error) {
            showError(error.message || 'An error occurred while searching for songs.');
        }
    });
    
    // Allow pressing Enter key in the textarea to search
    lyricsInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            searchButton.click();
        }
    });
});
