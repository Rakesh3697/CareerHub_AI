import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const Feedback: React.FC<Props> = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-slate-800">Thank You!</h2>
          <p className="text-slate-600 mt-2">Your feedback has been submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-800">Submit Feedback</h2>
        <p className="text-slate-500 mt-2">We'd love to hear your thoughts on our app.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm"
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
