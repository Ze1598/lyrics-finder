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
        timeout=15,
        retries=3,
        remove_section_headers=True,
        skip_non_songs=True,
        excluded_terms=["(Remix)", "(Live)"],
        verbose=False  # Set to True for debugging
    )
    # Add user agent to avoid 403 errors
    genius.verbose = False
    genius._session.headers.update({
        'User-Agent': 'LyricsFinder/1.0',
        'Accept': 'application/json'
    })
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
        # Use the search_song method instead of direct search for better compatibility
        search_results = genius.search_songs(lyrics_query)
        
        # Format the results
        songs = []
        
        # Process the results
        if isinstance(search_results, list):
            # New format from search_songs method
            for song in search_results:
                songs.append({
                    'title': song.get('title', 'Unknown Title'),
                    'artist': song.get('artist', {}).get('name', 'Unknown Artist') if isinstance(song.get('artist'), dict) else song.get('artist', 'Unknown Artist'),
                    'url': song.get('url', '#'),
                    'thumbnail': song.get('song_art_image_thumbnail_url', '')
                })
        elif isinstance(search_results, dict) and search_results.get('hits'):
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
        app.logger.error(f"Error searching lyrics: {str(e)}")
        return jsonify({'error': f"Error searching lyrics: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
