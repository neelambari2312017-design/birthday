import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { MUSIC } from './config'

// All songs in playback playlist sequence
const PLAYLIST = [
  MUSIC.envelope,
  MUSIC.garden,
  MUSIC.gallery,
  MUSIC.finale,
].filter((src, idx, arr) => src && arr.indexOf(src) === idx) // unique playlist tracks

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const audioRef = useRef(null)

  // Initialize central audio element once
  useEffect(() => {
    const audio = new Audio()
    audio.volume = 0.28
    audioRef.current = audio

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    
    // When one song completes, play the next one!
    const onEnded = () => {
      setTrackIndex((prev) => (prev + 1) % PLAYLIST.length)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // When trackIndex changes and music was started, load and play the next song
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || PLAYLIST.length === 0) return

    const newSrc = PLAYLIST[trackIndex]
    const currentSrcPath = audio.src ? new URL(audio.src, window.location.href).pathname : ''
    
    if (currentSrcPath !== newSrc) {
      audio.src = newSrc
      audio.load()
      if (started) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {})
      }
    }
  }, [trackIndex, started])

  // Start music upon user interaction (e.g., unlocking or tapping seal)
  const startMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setStarted(true)
    if (!audio.src) {
      audio.src = PLAYLIST[trackIndex]
      audio.load()
    }
    audio.play().then(() => setIsPlaying(true)).catch(() => {
      const unlock = () => {
        audio.play().then(() => setIsPlaying(true)).catch(() => {})
        window.removeEventListener('touchstart', unlock)
        window.removeEventListener('click', unlock)
      }
      window.addEventListener('touchstart', unlock, { once: true })
      window.addEventListener('click', unlock, { once: true })
    })
  }, [trackIndex])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!started) {
      startMusic()
      return
    }
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [started, startMusic])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!started) startMusic()
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }, [started, startMusic])

  const nextTrack = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length)
  }, [])

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        isPlaying,
        isMuted,
        started,
        trackIndex,
        startMusic,
        togglePlay,
        toggleMute,
        nextTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}
