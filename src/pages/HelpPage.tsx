import React from "react";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Book,
  ExternalLink,
} from "lucide-react";

/**
 * Help and Support page with FAQs, usage guide, and contact information
 */

export const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: "How do I start recording?",
      answer:
        "Click the microphone button on the main app page. Make sure your browser has microphone permissions enabled.",
    },
    {
      question: "What languages are supported?",
      answer:
        "Janus Arc supports multiple languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, and Chinese. The app can auto-detect your language or you can manually select it in the recorder.",
    },
    {
      question: "How long can my recordings be?",
      answer:
        "There's no strict limit on recording length, but longer recordings may take more time to process and transcribe.",
    },
    {
      question: "Can I edit my transcriptions?",
      answer:
        "Currently, you can regenerate transcriptions but direct editing is not available. We're working on adding this feature.",
    },
    {
      question: "How do I delete a recording?",
      answer:
        "In your history list, click the delete button (trash icon) next to any recording you want to remove.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take privacy seriously. Your recordings and transcriptions are stored securely and are only accessible to you.",
    },
    {
      question: "Can I download my recordings?",
      answer:
        "Yes, you can download both the audio files and transcriptions from your history list.",
    },
    {
      question: "What audio formats are supported?",
      answer:
        "The app records in standard web audio formats (typically WebM or MP4) that are supported by modern browsers.",
    },
  ];

  const usageSteps = [
    {
      step: 1,
      title: "Sign Up or Log In",
      description:
        "Create an account or log in to access the recording features.",
    },
    {
      step: 2,
      title: "Grant Microphone Access",
      description:
        "Allow your browser to access your microphone when prompted.",
    },
    {
      step: 3,
      title: "Select Language (Optional)",
      description:
        "Choose your language or let the app auto-detect it for better transcription accuracy.",
    },
    {
      step: 4,
      title: "Start Recording",
      description:
        "Click the microphone button to start recording your voice log.",
    },
    {
      step: 5,
      title: "Stop and Save",
      description:
        "Click stop when finished. Your recording will be automatically transcribed and saved to your history.",
    },
    {
      step: 6,
      title: "Review and Manage",
      description:
        "Access your recordings from the history list, where you can play them back, regenerate transcriptions, or delete them.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Help & Support</h1>
          </div>
          <p className="text-slate-400">
            Get help using Janus Arc and find answers to common questions
          </p>
        </div>

        <div className="space-y-12">
          {/* Quick Start Guide */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Book className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Quick Start Guide</h2>
            </div>

            <div className="space-y-4">
              {usageSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex space-x-4 p-4 bg-slate-800 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-slate-800 rounded-lg">
                  <summary className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors rounded-lg">
                    <span className="font-medium text-white">
                      {faq.question}
                    </span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Contact Support */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Contact Support</h2>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <p className="text-slate-300 mb-4">
                Can't find what you're looking for? We're here to help!
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:support@janusarc.com"
                  className="flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">Email Support</div>
                    <div className="text-sm text-slate-400">
                      support@janusarc.com
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                </a>

                <div className="p-3 bg-slate-700 rounded-lg">
                  <div className="font-medium text-white mb-1">
                    Response Time
                  </div>
                  <div className="text-sm text-slate-400">
                    We typically respond within 24 hours during business days.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <ExternalLink className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Additional Resources</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">
                  Browser Compatibility
                </h3>
                <p className="text-slate-300 text-sm">
                  Janus Arc works best with modern browsers like Chrome,
                  Firefox, Safari, and Edge.
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">
                  Microphone Setup
                </h3>
                <p className="text-slate-300 text-sm">
                  Ensure your microphone is properly connected and your browser
                  has permission to access it.
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Audio Quality</h3>
                <p className="text-slate-300 text-sm">
                  For best results, record in a quiet environment with minimal
                  background noise.
                </p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Privacy</h3>
                <p className="text-slate-300 text-sm">
                  Your recordings are private and secure. We never share your
                  data with third parties.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to App */}
        <div className="mt-12 text-center">
          <a
            href="/app"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            <span>Back to App</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
