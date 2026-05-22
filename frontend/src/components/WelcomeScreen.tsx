import { MessageSquare, LogIn, UserCircle } from 'lucide-react';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onContinueAsGuest: () => void;
}

export function WelcomeScreen({ onSignIn, onContinueAsGuest }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">University AI Assistant</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Your intelligent companion for navigating university life. Get instant answers, personalized assistance, and seamless access to campus services.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              How would you like to proceed?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={onSignIn}
                className="group relative p-8 rounded-xl border-2 border-gray-200 hover:border-blue-600 transition-all duration-300 hover:shadow-lg bg-white"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <LogIn className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign In</h3>
                  <p className="text-gray-600 mb-4">
                    Access personalized services tailored to your role within the university community
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      Continue
                      <svg className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={onContinueAsGuest}
                className="group relative p-8 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg bg-white"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                    <UserCircle className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue as Guest</h3>
                  <p className="text-gray-600 mb-4">
                    Browse general information about programs, admissions, and campus life
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center text-gray-600 font-semibold group-hover:gap-2 transition-all">
                      Continue
                      <svg className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600 mt-1">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">7</div>
                  <div className="text-sm text-gray-600 mt-1">User Roles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">100+</div>
                  <div className="text-sm text-gray-600 mt-1">Services</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Instant</div>
                  <div className="text-sm text-gray-600 mt-1">Responses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>© 2026 University AI Assistant. Powered by advanced AI technology.</p>
        </div>
      </div>
    </div>
  );
}
