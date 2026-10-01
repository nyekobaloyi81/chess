# Chess Game
https://nyekobaloyi81.github.io/chess/

A lightweight browser-based chess game built with HTML, CSS, and JavaScript. It includes a playable board, turn tracking, check detection, captured pieces, move log, undo/redo support, and a dark mode toggle.

## Features

- Full 8x8 chess board UI
- Legal move generation for standard pieces
- Turn-based play for white and black
- Check detection and game-over handling
- Castling support
- Captured pieces display
- Move log panel
- Undo and redo move controls
- Light/dark theme toggle
- Reset board button

## Project Structure

- `index.html` – main page layout
- `styles.css` – styling and theme design
- `piece_moveset.js` – chess movement logic for each piece
- `script.js` – game state, UI updates, and interaction handling

## How to Run

Since this is a plain front-end project, you can run it in either of these ways:

1. Open `index.html` directly in a browser.
2. Or serve the folder locally with a simple web server, for example:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Controls

- Click a piece to select it.
- Click a valid destination square to move.
- Use Reset Board to start a new game.
- Use Undo Move and Redo Move to step through the game history.
- Use the theme toggle to switch between light and dark mode.

## Notes

This project is a simple browser chess app and is best suited for learning, local play, and quick prototyping rather than full competitive chess rules or online multiplayer.
