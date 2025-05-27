# Ferro Clock

A digital clock built with React and Three.js, featuring a 7-segment display style that replicates classic digital clock aesthetics.

## Features

- Real-time digital clock display
- Customizable colors
- Interactive 3D environment (rotate, zoom, pan)
- 7-segment display for each digit
- Optional seconds display
- Smooth animations and glowing effect

## Technologies Used

- React with TypeScript
- Three.js for 3D rendering
- React Three Fiber & Drei for React-Three.js integration

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

5. Open your browser and visit `http://localhost:3000`

## Usage

The clock will start automatically showing the current time. You can:

- Rotate the view by dragging with the mouse
- Zoom in/out using the mouse wheel
- Pan the view by holding Shift while dragging

## Customization

You can customize the Clock component by modifying the props in the App.tsx file:

```tsx
<Clock 
  color="#ff5500"       // Change the color of the digits
  showSeconds={true}    // Toggle seconds display
  scale={0.8}           // Adjust the size of the clock
  backgroundColor="#000000"  // Change the background color
/>
```

## License

MIT

## Acknowledgements

- [React](https://reactjs.org/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)
