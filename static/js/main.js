document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const lyricsInput = document.getElementById('lyrics-input');
    const artistInput = document.getElementById('artist-input');
    const genreSelect = document.getElementById('genre-select');
    const searchButton = document.getElementById('search-button');
    const loadingElement = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    const errorMessage = document.getElementById('error-message');
    const apiKeyMessage = document.getElementById('api-key-message');

    // Function to show error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        loadingElement.classList.add('hidden');
    }

    // Function to create a song card element
    function createSongCard(song) {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';

        // Use a default image if no thumbnail is available
        const thumbnailUrl = song.thumbnail || 'static/images/default-album.png';

        songCard.innerHTML = `
            <div class="song-image">
                <img src="${thumbnailUrl}" alt="${song.title} album art" onerror="this.src='static/images/default-album.png'">
            </div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
                <a href="${song.url}" target="_blank" class="view-button">View on Genius</a>
            </div>
        `;
        return songCard;
    }

    // Function to search for songs
    async function searchSongs(lyrics) {
        const artist = artistInput.value.trim();
        const genre = genreSelect.value;

        try {
            const response = await fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    lyrics: lyrics,
                    artist: artist,
                    genre: genre
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search for songs');
            }

            return data.songs;
        } catch (error) {
            console.error('Error searching for songs:', error);
            throw error;
        }
    }

    // Event listener for search button
    searchButton.addEventListener('click', async () => {
        const lyrics = lyricsInput.value.trim();

        // Clear previous results
        resultsList.innerHTML = '';
        errorMessage.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        apiKeyMessage.classList.add('hidden');

        if (!lyrics) {
            showError('Please enter some lyrics to search for.');
            return;
        }

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
            loadingElement.classList.add('hidden');
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