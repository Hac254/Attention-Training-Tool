'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipForward, Volume2, Maximize2, Minimize2, HelpCircle, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const soundscapes = [
  { name: 'Forest Sounds', file: '/audio/forest.mp3', image: '/images/forest.jpg?height=300&width=400', color: 'from-green-200 to-green-400' },
{ name: 'Ocean Waves', file: '/audio/ocean.mp3', image: '/images/ocean.jpeg?height=300&width=400', color: 'from-blue-200 to-blue-400' },
{ name: 'City Noise', file: '/audio/city.mp3', image: '/images/city.jpeg?height=300&width=400', color: 'from-gray-200 to-gray-400' },
{ name: 'Quiet Room', file: '/audio/quiet-room.mp3', image: '/images/quiet-room.jpeg?height=300&width=400', color: 'from-purple-200 to-purple-400' },
{ name: 'Rainforest', file: '/audio/rainforest.mp3', image: '/images/rainforest.jpeg?height=300&width=400', color: 'from-emerald-200 to-emerald-400' },
]

const ambientSounds = [
  { name: 'Rain', file: '/audio/rain.mp3' },
  { name: 'Birds', file: '/audio/birds.mp3' },
  { name: 'Wind', file: '/audio/wind.mp3' },
  { name: 'Fire', file: '/audio/fire.mp3' },
]

const durations = [5, 10, 15, 20]

const focusExercises = [
  { type: 'narrow', instruction: 'Focus intently on a single sound, blocking out all others.' },
  { type: 'wide', instruction: 'Expand your awareness to encompass all sounds in the environment.' },
  { type: 'shift', instruction: 'Quickly shift your attention between different sounds.' },
  { type: 'rhythm', instruction: 'Focus on the rhythm or pattern in the sounds you hear.' },
  { type: 'visualize', instruction: 'Visualize the source of a particular sound in your mind.' },
]

const AttentionTrainingTool = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSoundscape, setCurrentSoundscape] = useState(soundscapes[0])
  const [ambientVolumes, setAmbientVolumes] = useState(ambientSounds.map(() => 0))
  const [duration, setDuration] = useState(5)
  const [volume, setVolume] = useState(0.5)
  const [progress, setProgress] = useState(0)
  const [currentFocus, setCurrentFocus] = useState('')
  const [sessionStats, setSessionStats] = useState({ shifts: 0, completedSessions: 0, averageShiftsPerSession: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [progressHistory, setProgressHistory] = useState<{ date: string; shifts: number }[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ambientAudioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    ambientAudioRefs.current.forEach((audio, index) => {
      if (audio) {
        audio.volume = ambientVolumes[index]
      }
    })
  }, [ambientVolumes])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startSession = () => {
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.play()
    }
    ambientAudioRefs.current.forEach((audio) => {
      if (audio) {
        audio.play()
      }
    })
    setProgress(0)
    setSessionStats(prev => ({ ...prev, shifts: 0 }))

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!)
          setIsPlaying(false)
          const newCompletedSessions = sessionStats.completedSessions + 1
          const newTotalShifts = sessionStats.shifts + sessionStats.averageShiftsPerSession * sessionStats.completedSessions
          const newAverageShifts = newTotalShifts / newCompletedSessions
          setSessionStats(prev => ({ 
            shifts: 0,
            completedSessions: newCompletedSessions,
            averageShiftsPerSession: newAverageShifts
          }))
          setProgressHistory(prevHistory => [
            ...prevHistory, 
            { date: new Date().toLocaleDateString(), shifts: sessionStats.shifts }
          ])
          return 100
        }
        return prev + (100 / (duration * 60))
      })

      // Sophisticated algorithm for attention-shifting prompts
      if (Math.random() > 0.8) {
        const exercise = focusExercises[Math.floor(Math.random() * focusExercises.length)]
        setCurrentFocus(exercise.instruction)
        setSessionStats(prev => ({ ...prev, shifts: prev.shifts + 1 }))
      }
    }, 1000)
  }

  const pauseSession = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    ambientAudioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause()
      }
    })
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resetSession = () => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentFocus('')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    ambientAudioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleAmbientVolumeChange = (index: number, value: number) => {
    setAmbientVolumes(prev => {
      const newVolumes = [...prev]
      newVolumes[index] = value / 100
      return newVolumes
    })
  }

  const tutorialSteps = [
    { title: "Welcome to MindfulFocus", content: "This tool will help you improve your attention through guided audio exercises." },
    { title: "Choose Your Soundscape", content: "Select a background sound that helps you focus and relax." },
    { title: "Set Your Session Duration", content: "Choose how long you want your attention training session to last." },
    { title: "Customize Ambient Sounds", content: "Mix in additional ambient sounds to create your perfect audio environment." },
    { title: "Follow the Prompts", content: "During your session, you'll receive prompts to guide your attention practice." },
    { title: "Track Your Progress", content: "After each session, you can view your stats and see how you're improving over time." },
  ]

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4">
        {/* Remove the following block entirely */}
        {/* <div className="max-w-md w-full mb-8">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Attention%20Training%20Tool-Mock%20up-bIQ5xEUl4DsTdVjCsXDThQ1eE8VMTd.svg" alt="Attention Training Tool" className="w-full h-auto" />
        </div> */}
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-8 text-center text-gray-800"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
        >
          MindfulFocus
        </motion.h1>
        <motion.p 
          className="text-xl mb-12 text-center max-w-md text-gray-600"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 120 }}
        >
          Enhance your attention and mindfulness through immersive audio experiences and guided exercises.
        </motion.p>
        <motion.button
          className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-orange-600 transition duration-300"
          onClick={() => {
            setShowSplash(false)
            setShowTutorial(true)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Your Journey
        </motion.button>
      </div>
    )
  }

  if (showTutorial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            {/* Remove the following block entirely */}
            {/* <div className="w-full mb-4">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Attention%20Training%20Tool-Mock%20up-bIQ5xEUl4DsTdVjCsXDThQ1eE8VMTd.svg" alt="Attention Training Tool" className="w-full h-auto" />
            </div> */}
            <CardTitle>{tutorialSteps[tutorialStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{tutorialSteps[tutorialStep].content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            {tutorialStep > 0 && (
              <Button onClick={() => setTutorialStep(prev => prev - 1)} className="bg-orange-500 hover:bg-orange-600 text-white">Previous</Button>
            )}
            {tutorialStep < tutorialSteps.length - 1 ? (
              <Button onClick={() => setTutorialStep(prev => prev + 1)} className="bg-orange-500 hover:bg-orange-600 text-white">Next</Button>
            ) : (
              <Button onClick={() => setShowTutorial(false)} className="bg-orange-500 hover:bg-orange-600 text-white">Start Training</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentSoundscape.color} flex items-center justify-center p-4 transition-colors duration-1000`}>
      <Card className="w-full max-w-4xl relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20" 
          style={{backgroundImage: `url(${currentSoundscape.image})`}}
        />
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl text-center">MindfulFocus</CardTitle>
          <CardDescription className="text-center">Immerse yourself in sound and attention training</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <Tabs defaultValue="session">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="session">Session</TabsTrigger>
              <TabsTrigger value="ambient">Ambient Sounds</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="session">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soundscape</label>
                  <Select
                    value={currentSoundscape.name}
                    onValueChange={(value) => setCurrentSoundscape(soundscapes.find(s => s.name === value)!)}
                  >
                    <SelectTrigger>
                      <SelectValue>{currentSoundscape.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {soundscapes.map((soundscape) => (
                        <SelectItem key={soundscape.name} value={soundscape.name}>
                          {soundscape.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue>{duration} minutes</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                  <div className="flex items-center">
                    <Volume2 className="mr-2" />
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(value) => setVolume(value[0] / 100)}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
                
                <AnimatePresence>
                  {currentFocus && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white bg-opacity-80 p-4 rounded-md text-center shadow-lg"
                    >
                      {currentFocus}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Progress value={progress} className="w-full" />
              </div>
            </TabsContent>
            <TabsContent value="ambient">
              <div className="space-y-4">
                {ambientSounds.map((sound, index) => (
                  <div key={sound.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{sound.name}</label>
                    <Slider
                      value={[ambientVolumes[index] * 100]}
                      onValueChange={(value) => handleAmbientVolumeChange(index, value[0])}
                      max={100}
                      step={1}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="stats">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Stats</h3>
                  <p>Attention Shifts: {sessionStats.shifts}</p>
                  <p>Completed Sessions: {sessionStats.completedSessions}</p>
                  <p>Average Shifts per Session: {sessionStats.averageShiftsPerSession.toFixed(2)}</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="shifts" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4 relative z-10">
          {!isPlaying ? (
            <Button onClick={startSession} className="bg-pink-500 hover:bg-pink-600 text-white">
              <Play className="mr-2 h-4 w-4" /> Start Session
            </Button>
          ) : (
            <Button onClick={pauseSession} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <Button onClick={resetSession} className="bg-orange-500 hover:bg-orange-600 text-white">
            <SkipForward className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={toggleFullscreen} className="bg-orange-500 hover:bg-orange-600 text-white">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowTutorial(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      <audio ref={audioRef} src={currentSoundscape.file} loop />
      {ambientSounds.map((sound, index) => (
        <audio 
          key={sound.name} 
          ref={el => {ambientAudioRefs.current[index] = el}} 
          src={sound.file} 
          loop 
        />
      ))}
    </div>
  )
}

export default AttentionTrainingTool