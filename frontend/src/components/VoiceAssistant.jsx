import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VoiceAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const navigate = useNavigate();

  // Voice assistant state machine steps
  const steps = [
    { id: 'greeting', speak: 'नमस्ते! मैं आपकी किसान सेतु सहायक हूँ। क्या मैं आपका पंजीकरण कर सकती हूँ? कृपया अपना नाम बताएं।' },
    { id: 'name', speak: 'धन्यवाद। अब कृपया अपना फ़ोन नंबर बताएं।' },
    { id: 'phone', speak: 'बहुत अच्छे। आपकी ज़मीन कितने एकड़ है?' },
    { id: 'landSize', speak: 'आप कौन सी मुख्य फसल उगाते हैं?' },
    { id: 'crop', speak: 'धन्यवाद! आपकी जानकारी सुरक्षित कर ली गई है। मैं आपको डैशबोर्ड पर ले जा रही हूँ।' }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    landSize: '',
    crop: '',
    soilType: 'Alluvial',
    district: 'Detected via Voice',
    lat: 28.6139,
    lng: 77.2090
  });

  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'hi-IN'; // Hindi
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserResponse(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setCurrentText('सुनने में समस्या हुई। कृपया फिर से माइक दबाएं।');
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, formData]);

  const speak = (text, callback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      
      // Try to find a Hindi voice, otherwise use default
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('in'));
      if (hindiVoice) utterance.voice = hindiVoice;

      utterance.onend = () => {
        if (callback) callback();
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      if (callback) callback();
    }
  };

  const handleUserResponse = (transcript) => {
    setCurrentText(`आपने कहा: "${transcript}"`);
    
    // Save data based on current step
    let newData = { ...formData };
    const stepId = steps[currentStepIndex].id;
    
    if (stepId === 'greeting') newData.name = transcript;
    else if (stepId === 'name') newData.phone = transcript;
    else if (stepId === 'phone') newData.landSize = transcript;
    else if (stepId === 'landSize') newData.crop = transcript;

    setFormData(newData);

    // Proceed to next step
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setTimeout(() => {
        setCurrentStepIndex(nextIndex);
        runStep(nextIndex);
      }, 1000);
    } else {
      // Finished
      localStorage.setItem('kisanSetuUser', JSON.stringify(newData));
      setTimeout(() => {
        setIsActive(false);
        navigate('/'); // Will redirect to dashboard since routing changed
      }, 3000);
    }
  };

  const runStep = (index) => {
    const step = steps[index];
    setCurrentText(step.speak);
    
    speak(step.speak, () => {
      // After speaking, start listening (unless it's the last step)
      if (index < steps.length - 1) {
        if (recognitionRef.current) {
          try {
            setIsListening(true);
            recognitionRef.current.start();
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  };

  const toggleAssistant = () => {
    if (isActive) {
      // Turn off
      window.speechSynthesis.cancel();
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsActive(false);
      setIsListening(false);
      setCurrentStepIndex(0);
    } else {
      // Turn on
      setIsActive(true);
      setCurrentStepIndex(0);
      runStep(0);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-24 lg:bottom-8 right-4 z-50 flex flex-col items-end gap-4">
        
        {isActive && (
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-brand-200 w-72 sm:w-80 animate-fade-in relative">
            <button onClick={toggleAssistant} className="absolute top-2 right-2 text-surface-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-brand-100 text-brand-600'}`}>
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-surface-900">AI Voice Assistant</h4>
                <p className="text-xs font-medium text-surface-500">
                  {isListening ? 'Listening (सुन रहा है)...' : 'Speaking (बोल रहा है)...'}
                </p>
              </div>
            </div>
            <p className="text-sm text-surface-700 bg-surface-50 p-3 rounded-xl border border-surface-100 min-h-[60px]">
              {currentText}
            </p>
            {isListening && (
              <div className="flex justify-center mt-3">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            )}
          </div>
        )}

        <button 
          onClick={toggleAssistant}
          className={`p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-110 flex items-center justify-center ${
            isActive ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white'
          }`}
        >
          <Mic className={`w-7 h-7 ${isActive ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </>
  );
}
