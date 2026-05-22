import { useState } from 'react';
import { Search, Menu, ChevronRight, ChevronDown, Calendar, Mail, Phone, MapPin, Globe, Facebook, Twitter, Youtube, Linkedin, Instagram } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AITWebsite() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1726390415698-3c60d6b16c02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHVuaXZlcnNpdHklMjBjYW1wdXMlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzY5MTUzMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Welcome to AIT',
      description: "AIT is an international English-speaking postgraduate institution, focusing on engineering, environment, and management studies. AIT's rigorous academic, research, and experiential outreach programs prepare graduates for professional success and leadership roles in Asia and beyond.",
      buttonText: 'Learn More',
      buttonLink: '#'
    },
    {
      image: 'https://images.unsplash.com/photo-1761318044223-a2dc78a104a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMG9yaWVudGF0aW9ufGVufDF8fHx8MTc2OTE1MzMzMHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'New Academic Term begins at AIT',
      description: 'Join our vibrant international community of students from over 50 countries.',
      buttonText: '',
      buttonLink: ''
    },
    {
      image: 'https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMGxhYm9yYXRvcnklMjBzY2llbnRpc3R8ZW58MXx8fHwxNzY5MTUyNjUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'AIT Launches AI Research Center',
      description: 'New state-of-the-art facility to advance artificial intelligence research in Southeast Asia.',
      buttonText: 'Learn More',
      buttonLink: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Desktop */}
      <div className="hidden lg:block bg-[#4a7a3d] text-white py-2.5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 hover:text-gray-200">
                <Mail className="w-3.5 h-3.5" />
                contact@ait.ac.th
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-gray-200">
                <Phone className="w-3.5 h-3.5" />
                +66 2 524 5000
              </a>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-200">BOI STP</a>
              <a href="#" className="hover:text-gray-200">Intranet</a>
              <a href="#" className="hover:text-gray-200">Students</a>
              <a href="#" className="hover:text-gray-200">Contact</a>
              <a href="#" className="hover:text-gray-200">Giving</a>
              <a href="#" className="hover:text-gray-200">Alumni</a>
              <button className="flex items-center gap-1 hover:text-gray-200">
                <Globe className="w-4 h-4" />
                EN
              </button>
              <button className="hover:text-gray-200">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Desktop */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#4a7a3d] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">AIT</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-base leading-tight">Asian Institute of Technology</div>
                <div className="text-xs text-gray-600">Excellence in Education & Research</div>
              </div>
            </div>
            <nav className="flex items-center gap-8">
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#61a229] font-medium">
                  About <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#61a229] font-medium">
                  Academics <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#61a229] font-medium">
                  Apply <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#61a229] font-medium">
                  Research <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <a href="#" className="text-gray-700 hover:text-[#61a229] font-medium">Centers</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-[#4a7a3d] sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-[#4a7a3d] font-bold text-lg">AIT</span>
              </div>
              <div>
                <div className="font-semibold text-white text-sm leading-tight">Asian Institute of Technology</div>
                <div className="text-xs text-gray-100">Excellence in Education & Research</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-white">
                <Search className="w-5 h-5" />
              </button>
              <button className="text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <section className="relative h-[500px] lg:h-[600px] bg-gradient-to-r from-[#2d5016] to-[#3C6031] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={slides[currentSlide].image}
            alt="AIT Campus"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d5016]/70 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-base lg:text-lg mb-8 leading-relaxed">
              {slides[currentSlide].description}
            </p>
            {slides[currentSlide].buttonText && (
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-[#4a7a3d] px-6 py-3 rounded font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                  {slides[currentSlide].buttonText}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-[#4a7a3d] transition-colors">
                  Schedule Visit
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-8 h-0.5 rounded-full transition-all ${
                currentSlide === index ? 'bg-white' : 'bg-white/40'
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#" className="flex flex-col items-center p-6 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#61a229] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
              <span className="text-gray-900 font-semibold">Faculties</span>
            </a>
            <a href="#" className="flex flex-col items-center p-6 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#61a229] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-gray-900 font-semibold">Programs</span>
            </a>
            <a href="#" className="flex flex-col items-center p-6 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#61a229] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <span className="text-gray-900 font-semibold">Admissions</span>
            </a>
            <a href="#" className="flex flex-col items-center p-6 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#61a229] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </div>
              <span className="text-gray-900 font-semibold">Eligibility</span>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#5a8f47] text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-1">60+</div>
              <div className="text-sm text-green-100">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-1">3,000+</div>
              <div className="text-sm text-green-100">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-1">50+</div>
              <div className="text-sm text-green-100">Nationalities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold mb-1">100%</div>
              <div className="text-sm text-green-100">International</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Thematic Areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Key thematic areas</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The current five thematic areas of research at AIT, based on our expertise, are as follows. Explore more by clicking on the theme of your interest.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Climate Change', color: 'from-[#2d5016] to-[#3C6031]' },
              { name: 'Smart Communities', color: 'from-[#3C6031] to-[#4a7a3d]' },
              { name: 'Food-Energy-Water', color: 'from-[#4a7a3d] to-[#5a8f47]' },
              { name: 'Infrastructure', color: 'from-[#5a8f47] to-[#6ea355]' },
              { name: 'Technology, Policy and Society', color: 'from-[#6ea355] to-[#7fb069]' }
            ].map((theme, index) => (
              <a
                key={index}
                href="#"
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center group"
              >
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${theme.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="text-gray-900 font-semibold">{theme.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* News */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">News</h2>
                <a href="#" className="text-[#61a229] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  See more news <ChevronRight className="w-5 h-5" />
                </a>
              </div>
              <div className="space-y-6">
                <article className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMGxhYm9yYXRvcnklMjBzY2llbnRpc3R8ZW58MXx8fHwxNzY5MTUyNjUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="News"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>January 20, 2026</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      AIT Ranked #5 in Thailand by ScholarGPS
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Six faculty members named among top scholars in their fields
                    </p>
                  </div>
                </article>
                <article className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1761318044223-a2dc78a104a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMG9yaWVudGF0aW9ufGVufDF8fHx8MTc2OTE1MzMzMHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="News"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>January 18, 2026</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                      Second Cohort of KPCIP Women Scholars
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Begins Master's Studies at AIT
                    </p>
                  </div>
                </article>
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Events</h2>
                <a href="#" className="text-[#61a229] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  See more events <ChevronRight className="w-5 h-5" />
                </a>
              </div>
              <div className="space-y-4">
                <a href="#" className="flex gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-3xl font-bold text-[#61a229]">28</div>
                    <div className="text-sm text-gray-600">Jan</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Workshop on Evidence-based policymaking
                    </h3>
                    <p className="text-sm text-gray-600">
                      Strategic foresight and energy–climate modeling
                    </p>
                  </div>
                </a>
                <a href="#" className="flex gap-4 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-3xl font-bold text-[#61a229]">16</div>
                    <div className="text-sm text-gray-600">Mar</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      International Training on Climate-Resilient Digital Agriculture
                    </h3>
                    <p className="text-sm text-gray-600">
                      With Emerging Technologies
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts and Figures */}
      <section className="py-16 bg-gradient-to-r from-[#3C6031] to-[#4a7a3d] text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="80"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-center">Facts and Figures</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-[#a1be37]">1,700+</div>
              <div className="text-sm">Students from 50+ countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-[#a1be37]">34</div>
              <div className="text-sm">Board of trustee members from 19 countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-[#a1be37]">190+</div>
              <div className="text-sm">Ongoing research projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-[#a1be37]">160+</div>
              <div className="text-sm">World-class faculty from 20+ countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Faculties</h2>
            <p className="text-lg text-gray-600">
              AIT is a leading international postgraduate institution offering Master and Doctoral degree programs in six faculties.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Faculty of Business Management', image: 'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbmFnZW1lbnQlMjBjbGFzc3Jvb218ZW58MXx8fHwxNzY5MTUzMzM4fDA&ixlib=rb-4.1.0&q=80&w=1080' },
              { name: 'Faculty of Climate Change', image: 'https://images.unsplash.com/photo-1752937285396-df7c206f47f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwc3VzdGFpbmFiaWxpdHklMjByZXNlYXJjaHxlbnwxfHx8fDE3NjkxNTMzNDF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
              { name: 'Faculty of Infrastructure', image: 'https://images.unsplash.com/photo-1762793214504-36d4464ba24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZW50cmFuY2UlMjBnYXRlfGVufDF8fHx8MTc2OTE1MzMyN3ww&ixlib=rb-4.1.0&q=80&w=1080' },
              { name: 'Faculty of Public Policy', image: 'https://images.unsplash.com/photo-1726390415698-3c60d6b16c02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHVuaXZlcnNpdHklMjBjYW1wdXMlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzY5MTUzMzE5fDA&ixlib=rb-4.1.0&q=80&w=1080' },
              { name: 'Faculty of Resource', image: 'https://images.unsplash.com/photo-1752937285396-df7c206f47f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwc3VzdGFpbmFiaWxpdHklMjByZXNlYXJjaHxlbnwxfHx8fDE3NjkxNTMzNDF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
              { name: 'Faculty of Technology', image: 'https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMGxhYm9yYXRvcnklMjBzY2llbnRpc3R8ZW58MXx8fHwxNzY5MTUyNjUzfDA&ixlib=rb-4.1.0&q=80&w=1080' }
            ].map((faculty, index) => (
              <a
                key={index}
                href="#"
                className="group relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <ImageWithFallback
                  src={faculty.image}
                  alt={faculty.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white">{faculty.name}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax CTA */}
      <section className="relative h-96 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1762793214504-36d4464ba24d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwZW50cmFuY2UlMjBnYXRlfGVufDF8fHx8MTc2OTE1MzMyN3ww&ixlib=rb-4.1.0&q=80&w=1080')` }}>
        <div className="absolute inset-0 bg-[#3C6031]/80"></div>
        <div className="relative max-w-4xl mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Explore AIT campus</h2>
          <p className="text-lg mb-8 max-w-2xl">
            AIT is situated on a vast green area, 40KM north of Bangkok. Explore our campus facilities, find great places to eat and drink, get directions to our main campus.
          </p>
          <button className="bg-white text-[#3C6031] px-8 py-3 rounded font-semibold hover:bg-gray-100 transition-colors">
            Explore AIT campus
          </button>
        </div>
      </section>

      {/* Newsletter & Social */}
      <section className="bg-[#3C6031] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Subscribe to our newsletter</h3>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email*"
                  className="flex-1 px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:border-[#a1be37]"
                />
                <button className="bg-[#61a229] text-white px-6 py-3 rounded font-semibold hover:bg-[#4e8221] transition-colors">
                  Submit
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow us on social media</h3>
              <div className="flex gap-4">
                {[Facebook, Youtube, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded flex items-center justify-center hover:bg-[#61a229] transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#28393e] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-6 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                  <span className="text-[#3C6031] font-bold">AIT</span>
                </div>
                <span className="font-semibold">Asian Institute of Technology</span>
              </div>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>P.O. Box 4, 58 Moo 9, Km. 42, Paholyothin Highway, Klong Luang, Pathum Thani 12120 Thailand</span>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>(+66) 25245000</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About AIT</a></li>
                <li><a href="#" className="hover:text-white">Facts and figures</a></li>
                <li><a href="#" className="hover:text-white">Rankings</a></li>
                <li><a href="#" className="hover:text-white">Leadership</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Academics</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Academic calendar</a></li>
                <li><a href="#" className="hover:text-white">Programs</a></li>
                <li><a href="#" className="hover:text-white">Study options</a></li>
                <li><a href="#" className="hover:text-white">Faculties</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Apply to AIT</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Admissions</a></li>
                <li><a href="#" className="hover:text-white">Financial aid</a></li>
                <li><a href="#" className="hover:text-white">Tuition and fees</a></li>
                <li><a href="#" className="hover:text-white">Apply online</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Research</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Research Centers</a></li>
                <li><a href="#" className="hover:text-white">Research Themes</a></li>
                <li><a href="#" className="hover:text-white">Research Projects</a></li>
                <li><a href="#" className="hover:text-white">Publications</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 flex flex-wrap gap-4 justify-between text-sm text-gray-400">
            <div>©2024 Asian Institute of Technology. All Rights Reserved.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms and conditions</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
