# Lyrics Finder

A web application that allows users to search for songs based on lyrics excerpts. Simply enter a portion of lyrics you remember, and the app will find songs that match those lyrics.

## Features

- Search for songs by lyrics
- Display song details including title, artist, and album art
- Link to the full lyrics on Genius

## Prerequisites

- Python 3.6 or higher
- A Genius API key (get one from [Genius API Clients](https://genius.com/api-clients))

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root directory with your Genius API key:

```
GENIUS_API_KEY=your_genius_api_key_here
```

## Usage

1. Start the application:

```bash
python app.py
```

2. Open your web browser and go to `http://127.0.0.1:5000`
3. Enter lyrics in the text area and click "Find Songs"
4. Browse through the search results and click on a song to view the full lyrics on Genius

## How It Works

The application uses the Genius API to search for songs based on the lyrics you provide. When you submit a search query, the application sends a request to the Genius API, which returns a list of songs that match your query. The application then displays the results, including the song title, artist, and album art.

## Technologies Used

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- API: Genius API for lyrics search

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Genius](https://genius.com) for providing the lyrics database and API
- [LyricsGenius](https://github.com/johnwmillr/LyricsGenius) for the Python wrapper for the Genius API
