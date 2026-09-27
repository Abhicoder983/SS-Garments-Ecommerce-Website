import { useRef, useEffect } from 'react';
import music from '../assets/Music/Music.mp3';

function BackgroundMusic() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    let started = false;

    const startMusic = () => {
      if (started) return;
      started = true;

      audio.volume = 1;
      audio.play()
        .then(() => console.log('Music started'))
        .catch((err) => {
          console.log('Play failed:', err);
          started = false;
        });

      window.removeEventListener('click', startMusic, true);
      window.removeEventListener('touchstart', startMusic, true);
      window.removeEventListener('keydown', startMusic, true);
    };

    window.addEventListener('click', startMusic, true);
    window.addEventListener('touchstart', startMusic, true);
    window.addEventListener('keydown', startMusic, true);

    return () => {
      window.removeEventListener('click', startMusic, true);
      window.removeEventListener('touchstart', startMusic, true);
      window.removeEventListener('keydown', startMusic, true);
    };
  }, []);

  return (
    <audio ref={audioRef} loop>
      <source src={music} type="audio/mpeg" />
    </audio>
  );
}

export default BackgroundMusic;