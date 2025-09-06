import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle} from 'lucide-react';

// Replace with your image path
// import HelpAvatar from '/src/Assets/bot.jpg'; 

const faqs = [
  {
    question: 'How can I download a User Manual?',
    answer: 'You can download the User Manual <a href="src/Assets/manual.pdf" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">here</a>.',
  },
  {
    question: 'How do I post a lost item?',
    answer: 'Click the "+ Post Item" button on the navigation bar and fill in the item details.',
  },
  {
    question: 'Can I edit my post later?',
    answer: 'Yes, go to your dashboard and click on the item to edit it.',
  },
  {
    question: 'What if I found someone\'s item?',
    answer: 'You can post it under the "Found" category using the same process.',
  },
   {
    question: 'Where can I access the dashboard?',
    answer: 'You can access the dashboard by logging into the application or signing up if you are a new user.',
  },
];

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-50 bg-orange p-4 rounded-full shadow-xl hover:bg-darkOrange transition-colors"
      aria-label="Help / Chat"
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <HelpCircle className="w-6 h-6 text-white" />
      )}
    </button>


      {/* Animated Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={boxRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b font-semibold text-[#251A65] bg-gray-50">
              Need Help?
            </div>
            <div className="p-4 text-sm text-gray-800 max-h-96 overflow-y-auto space-y-3">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    className="w-full text-left font-medium text-[#251A65] hover:underline"
                    onClick={() =>
                      setOpenIndex(index === openIndex ? null : index)
                    }
                  >
                    {faq.question}
                  </button>
                  {openIndex === index && (
                   <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-1 text-gray-600"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;