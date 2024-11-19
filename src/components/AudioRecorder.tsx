import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Trash2, Pause, Play, Waveform, X } from 'lucide-react';

interface AudioRecorderProps {
  onSave: (audioUrl: string, duration: number, title: string) => void;
  onClose: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [recordingTitle, setRecordingTitle] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVisualizer = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const updateVisualizer = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const normalizedData = Array.from(dataArray.slice(0, 32)).map(value => value / 255);
      setVisualizerData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setRecordingTitle(`Recording ${new Date().toLocaleTimeString()}`);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startVisualizer(stream);

      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearIntervals();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const clearIntervals = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      clearIntervals();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Voice Recording</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Visualizer */}
        <div className="h-32 bg-gray-900 rounded-xl p-4 mb-8 flex items-end justify-center space-x-1">
          {visualizerData.map((value, index) => (
            <div
              key={index}
              className="w-2 bg-blue-500 rounded-t transition-all duration-75"
              style={{
                height: `${value * 100}%`,
                minHeight: '4px'
              }}
            />
          ))}
          {!isRecording && !audioUrl && (
            <div className="absolute text-white">
              Press record to start
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="text-4xl font-mono text-center mb-8">
          {formatTime(timer)}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-6 mb-8">
          {!isRecording && !audioUrl ? (
            <button
              onClick={startRecording}
              className="p-6 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center space-x-2"
            >
              <Mic size={24} />
              <span>Start Recording</span>
            </button>
          ) : isRecording ? (
            <div className="flex items-center space-x-4">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  <Pause size={24} />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                >
                  <Play size={24} />
                </button>
              )}
              <button
                onClick={stopRecording}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <Square size={24} />
              </button>
            </div>
          ) : null}
        </div>

        {/* Preview and Save */}
        {audioUrl && !isRecording && (
          <div className="space-y-4">
            <input
              type="text"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recording title..."
            />
            <audio controls src={audioUrl} className="w-full" />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  if (audioUrl && recordingTitle.trim()) {
                    onSave(audioUrl, timer, recordingTitle);
                  } else {
                    alert('Please enter a title for your recording');
                  }
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Save size={18} className="mr-2" />
                Save Recording
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <Trash2 size={18} className="mr-2" />
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};