import { GraduationCap, BookOpen, Users, Calendar, Award, MapPin } from 'lucide-react';

export function UniversityWebsite() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              <span className="text-2xl font-bold">State University</span>
            </div>
            <div className="hidden md:flex gap-6">
              <a href="#" className="hover:text-blue-200 transition-colors">Academics</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Admissions</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Research</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Campus Life</a>
              <a href="#" className="hover:text-blue-200 transition-colors">About</a>
            </div>
            <button className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Apply Now
            </button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Your Future Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join a community of scholars, innovators, and leaders shaping tomorrow's world
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Explore Programs
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
              Schedule a Visit
            </button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-900">15,000+</div>
              <div className="text-gray-600 mt-2">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900">200+</div>
              <div className="text-gray-600 mt-2">Programs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900">95%</div>
              <div className="text-gray-600 mt-2">Job Placement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-900">$50M+</div>
              <div className="text-gray-600 mt-2">Research Funding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose State University?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Academic Excellence</h3>
            <p className="text-gray-600">
              World-class faculty and cutting-edge research opportunities across all disciplines
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Vibrant Community</h3>
            <p className="text-gray-600">
              Diverse student body with 300+ clubs and organizations to join
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Career Success</h3>
            <p className="text-gray-600">
              Comprehensive career services and strong industry partnerships
            </p>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Latest News
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>January 20, 2026</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">New Research Center Opens</h3>
                <p className="text-gray-600">
                  State University unveils state-of-the-art AI research facility
                </p>
              </div>
            </article>

            <article className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>January 15, 2026</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Record Applications Received</h3>
                <p className="text-gray-600">
                  2026 admission cycle sees 30% increase in applicants
                </p>
              </div>
            </article>

            <article className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>January 10, 2026</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Alumni Success Stories</h3>
                <p className="text-gray-600">
                  Three graduates named to Forbes 30 Under 30 list
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6" />
                <span className="text-xl font-bold">State University</span>
              </div>
              <p className="text-gray-400">
                Excellence in education since 1890
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">News</a></li>
                <li><a href="#" className="hover:text-white">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Academics</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Programs</a></li>
                <li><a href="#" className="hover:text-white">Departments</a></li>
                <li><a href="#" className="hover:text-white">Libraries</a></li>
                <li><a href="#" className="hover:text-white">Research</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>123 University Ave<br />College Town, ST 12345</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 State University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
