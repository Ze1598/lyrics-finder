import os
from flask import Flask, render_template, request, jsonify
import lyricsgenius
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Genius API client
# Using the access token from .env file
GENIUS_ACCESS_TOKEN = os.getenv('GENIUS_ACCESS_TOKEN')

# Configure the Genius client with the access token
if GENIUS_ACCESS_TOKEN:
    genius = lyricsgenius.Genius(
        access_token=GENIUS_ACCESS_TOKEN,
        timeout=10,
        retries=3,
        verbose=False  # Set to True for debugging
    )
else:
    genius = None

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_lyrics():
    """Search for songs based on lyrics."""
    if not genius:
        return jsonify({'error': 'Genius access token not configured'}), 500
    
    lyrics_query = request.json.get('lyrics', '')
    if not lyrics_query:
        return jsonify({'error': 'No lyrics provided'}), 400
    
    try:
        # Search for songs with matching lyrics
        search_results = genius.search(lyrics_query)
        
        # Format the results
        songs = []
        
        # The response format can vary depending on the API version and authentication method
        # Handle both possible response formats
        if isinstance(search_results, dict) and search_results.get('hits'):
            # Format for direct API access with client access token
            for hit in search_results['hits']:
                result = hit.get('result')
                if result:
                    song = {
                        'title': result.get('title', 'Unknown Title'),
                        'artist': result.get('primary_artist', {}).get('name', 'Unknown Artist'),
                        'url': result.get('url', '#'),
                        'thumbnail': result.get('song_art_image_thumbnail_url', '')
                    }
                    songs.append(song)
        elif hasattr(search_results, 'response') and hasattr(search_results.response, 'hits'):
            # Alternative format sometimes returned by the library
            for hit in search_results.response.hits:
                if hasattr(hit, 'result'):
                    result = hit.result
                    song = {
                        'title': getattr(result, 'title', 'Unknown Title'),
                        'artist': getattr(getattr(result, 'primary_artist', {}), 'name', 'Unknown Artist'),
                        'url': getattr(result, 'url', '#'),
                        'thumbnail': getattr(result, 'song_art_image_thumbnail_url', '')
                    }
                    songs.append(song)
        
        return jsonify({'songs': songs})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
