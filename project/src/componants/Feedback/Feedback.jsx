import React from 'react';
import { MessageCircle } from 'lucide-react';

function Feedback() {
   

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6 space-y-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <MessageCircle className="text-gray-700" size={28} />
          <h2 className="text-xl font-semibold text-gray-800">Share Your Feedback</h2>
        </div>
        <form className="space-y-4" action='https://formsubmit.co/shabeebkaruvath@gmail.com' method='POST'>
          <label htmlFor="subject" className="sr-only">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="Subject"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-gray-700 bg-transparent placeholder-gray-400"
          />
          <label htmlFor="message" className="sr-only">Your Feedback</label>
          <textarea
            id="message"
            name="message"
            placeholder="Please share your thoughts with us..."
            required
           
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 resize-y min-h-[150px] text-gray-700 bg-transparent placeholder-gray-400"
          />
         
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors duration-200"
          >
            <span>Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
