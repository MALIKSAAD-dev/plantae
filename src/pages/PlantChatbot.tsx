import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaPlus, FaTrash, FaEllipsisV, FaSpinner, FaTimes, FaInfoCircle, FaLock, FaExclamationCircle, FaTools, FaLeaf, FaHeartbeat } from 'react-icons/fa';
import { getChatResponse } from '../lib/gemini';
import { 
  Chat, 
  Message,
  getAllChats, 
  createChat, 
  addMessageToChat, 
  deleteChat,
  createAnonymousChat,
  getAnonymousChats,
  addMessageToAnonymousChat,
  deleteAnonymousChat
} from '../lib/firebaseChat';
import { useAuth } from '../contexts/AuthContext';
import { incrementUsage, getRemainingUsage, hasReachedLimit } from '../lib/usageTracker';
import { Link } from 'react-router-dom';

// Typing animation component for displaying messages with a typing effect
const LoadingIndicator = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <div className="h-2 w-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
      <span className="ml-2 text-sm text-gray-500">Plantae is thinking...</span>
    </div>
  );
};

// Format text with proper styling for headings and lists
const formatText = (content: string) => {
  // Split text into lines for processing
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Remove any leading/trailing whitespace
    const trimmedLine = line.trim();
    
    // Check for headings (lines with # or **SECTION:** format)
    if (trimmedLine.match(/^#{1,6}\s/) || trimmedLine.match(/^\*\*[A-Z\s]+:\*\*/)) {
      const headingText = trimmedLine
        .replace(/^#{1,6}\s/, '')  // Remove # markers
        .replace(/^\*\*/, '')      // Remove opening **
        .replace(/\*\*$/, '')      // Remove closing **
        .replace(/:$/, '');        // Remove trailing colon
      
      return (
        <div key={index} className="font-bold text-black my-3 text-lg">
          {headingText}
        </div>
      );
    }
    
    // Check for list items (lines starting with -, *, or number.)
    else if (trimmedLine.match(/^[\*\-]\s/) || trimmedLine.match(/^\d+\.\s/)) {
      // Extract the content after the bullet point or number
      const content = trimmedLine
        .replace(/^[\*\-]\s+/, '')     // Remove bullet point
        .replace(/^\d+\.\s+/, '')      // Remove numbers
        .replace(/\*\*/g, '')          // Remove bold markdown
        .replace(/\*/g, '')            // Remove italic markdown
        .trim();

      return (
        <div key={index} className="flex items-start my-2">
          <span className="mr-2 text-emerald-500">•</span>
          <span className="flex-1">{content}</span>
        </div>
      );
    }
    
    // Check for bold and italic text (**text** or *text*)
    else if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
      const parts = [];
      let currentText = trimmedLine;
      let lastIndex = 0;
      
      // Handle bold text first (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      let boldMatch;
      while ((boldMatch = boldRegex.exec(currentText)) !== null) {
        // Add text before the match
        if (boldMatch.index > lastIndex) {
          parts.push(
            <span key={`${index}-${lastIndex}`}>
              {currentText.substring(lastIndex, boldMatch.index)}
            </span>
          );
        }
        
        // Add the bold text
        parts.push(
          <span key={`${index}-bold-${boldMatch.index}`} className="font-bold">
            {boldMatch[1]}
          </span>
        );
        
        lastIndex = boldMatch.index + boldMatch[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < currentText.length) {
        // Handle any remaining italic text (*text*)
        const remainingText = currentText.substring(lastIndex);
        const italicRegex = /\*(.*?)\*/g;
        let italicMatch;
        let italicLastIndex = 0;
        
        while ((italicMatch = italicRegex.exec(remainingText)) !== null) {
          if (italicMatch.index > italicLastIndex) {
            parts.push(
              <span key={`${index}-${lastIndex + italicLastIndex}`}>
                {remainingText.substring(italicLastIndex, italicMatch.index)}
              </span>
            );
          }
          
          parts.push(
            <span key={`${index}-italic-${italicMatch.index}`} className="italic">
              {italicMatch[1]}
            </span>
          );
          
          italicLastIndex = italicMatch.index + italicMatch[0].length;
        }
        
        if (italicLastIndex < remainingText.length) {
          parts.push(
            <span key={`${index}-${lastIndex + italicLastIndex}`}>
              {remainingText.substring(italicLastIndex)}
            </span>
          );
        }
      }
      
      return <div key={index} className="my-2">{parts}</div>;
    }
    
    // Regular paragraph text (skip empty lines)
    else if (trimmedLine) {
      return <div key={index} className="my-2">{trimmedLine}</div>;
    }
    
    // Empty lines get a smaller spacing
    return <div key={index} className="my-1"></div>;
  });
};

const PlantChatbot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 mx-4">
        <div className="text-center">
          {/* Icon Container */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center">
              <FaRobot className="text-4xl text-emerald-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-2">
              <FaTools className="text-white text-sm" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Plant Chat Under Development 🌿
          </h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <FaInfoCircle className="text-amber-600 mr-2" />
              <span className="font-medium text-amber-800">Development Notice</span>
            </div>
            <p className="text-amber-700 text-sm">
              Hi! I'm M.Saad, and I'm currently enhancing the Plant Chat feature to make it even better. 
              The improved version will be available soon!
            </p>
          </div>

          <p className="text-gray-600 mb-8">
            Meanwhile, check out these amazing features I've created:
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link 
              to="/identification" 
              className="p-4 border border-emerald-200 rounded-lg hover:border-emerald-400 transition-colors bg-white group"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <FaLeaf className="text-emerald-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-800">Plant Identification</h3>
              </div>
              <p className="text-sm text-gray-600">
                Upload a photo and instantly identify any plant species
              </p>
            </Link>

            <Link 
              to="/health" 
              className="p-4 border border-emerald-200 rounded-lg hover:border-emerald-400 transition-colors bg-white group"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <FaHeartbeat className="text-emerald-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-800">Health Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get instant diagnosis and treatment for plant health issues
              </p>
            </Link>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gray-50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">
              Stay Updated!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Leave your email to be notified when I launch the enhanced Plant Chat feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantChatbot;