import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Trash2, X } from 'lucide-react';

interface AudioRecorderProps {
  onSave: (audioUrl: string, duration: number, title: string) => void;
  onClose: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [visualizerData, setVisualizerData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVisualizer = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const updateVisualizer = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const normalizedData = Array.from(dataArray.slice(0, 20)).map(value => value / 255);
      setVisualizerData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
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

      // Start timer
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
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleSave = () => {
    if (audioUrl && recordingTitle.trim()) {
      onSave(audioUrl, timer, recordingTitle);
    } else {
      alert('Please enter a title for your recording');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="fixed inset-x-0 bottom-0 bg-black bg-opacity-90 text-white p-6 shadow-lg">
      <div className="max-w-4xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute -top-2 right-0 p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center space-y-6">
          {/* Visualizer */}
          <div className="w-full h-24 flex items-center justify-center space-x-1 bg-gray-800 rounded-lg p-4">
            {visualizerData.map((value, index) => (
              <div
                key={index}
                className="w-2 bg-blue-500 rounded-full transition-all duration-50"
                style={{
                  height: `${value * 100}%`,
                  minHeight: '4px'
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-4xl font-mono font-bold">
            {formatTime(timer)}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors flex items-center space-x-2"
              >
                <Mic size={24} />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors flex items-center space-x-2"
              >
                <Square size={24} />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {/* Preview and Save */}
          {audioUrl && !isRecording && (
            <div className="w-full max-w-xl space-y-4">
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="Enter recording title..."
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              />
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Save Recording
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <Trash2 size={18} className="mr-2" />
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};