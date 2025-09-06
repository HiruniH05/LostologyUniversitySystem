// import React from 'react';
import { MapPin, Users, Shield, Clock, Heart, Zap } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Interactive Map',
      description: 'Visualize lost and found items across campus with our intuitive map interface'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Built by students, for students. Connect with your campus community'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'University email verification ensures a trusted environment for all users'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get instant notifications when items matching your criteria are posted'
    },
    {
      icon: Heart,
      title: 'Easy to Use',
      description: 'Simple, intuitive interface designed for busy students and staff'
    },
    {
      icon: Zap,
      title: 'Fast Recovery',
      description: 'Streamlined claiming process helps reunite you with your items quickly'
    }
  ];

  // const stats = [
  //   { number: '1,247', label: 'Active Users' },
  //   { number: '3,856', label: 'Items Posted' },
  //   { number: '84%', label: 'Success Rate' },
  //   { number: '15+', label: 'Campus Buildings' }
  // ];

  // const team = [
  //   {
  //     name: 'Sarah Chen',
  //     role: 'Project Lead',
  //     description: 'Computer Science major passionate about building solutions for campus life',
  //     image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300'
  //   },
  //   {
  //     name: 'Mike Rodriguez',
  //     role: 'Lead Developer',
  //     description: 'Full-stack developer with a focus on user experience and accessibility',
  //     image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300'
  //   },
  //   {
  //     name: 'Emma Johnson',
  //     role: 'UI/UX Designer',
  //     description: 'Design student creating intuitive interfaces for digital products',
  //     image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300'
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-navy relative overflow-hidden text-white">
      {/* Abstract blob-style background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bg-blue-600 opacity-60 rounded-full w-[400px] h-[400px] top-[-100px] left-[-150px] blur-3xl"></div>
        <div className="absolute opacity-50 rounded-full w-[300px] h-[300px] bottom-[60px] right-[90px]"><img src="/src/Assets/pin.png" className="w-120 h-120 text-white" /></div>
      <div className="relative bg-victory-green opacity-80 rounded-full w-[400px] h-[400px] bottom-[-100px] right-[-90px] blur-3xl"></div>
      </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="">
                {/* <img src="/src/Assets/pin.png" className="w-12 h-12 text-white" /> */}
              </div>
            </div>
            <h1 className="text-4xl md:text-4xl font-bold mb-6">About Lostology</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connecting campus communities to help recover lost items and reunite people with their belongings
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Lostology?</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Every day, students and staff lose valuable items across campus. From phones and laptops to keys and textbooks, 
            these losses can be stressful and costly. Lostology was created to bridge the gap between those who lose items 
            and those who find them, creating a centralized platform that makes recovery simple and efficient.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Lostology combines modern technology with community collaboration to create the most effective 
              lost and found system for university campuses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet the Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lostology was created by passionate students who believe technology can solve real campus problems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Values Section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community First</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in the power of community collaboration. Every feature we build is designed to strengthen 
                connections between students and staff, fostering a culture of mutual support and helpfulness.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your safety is our priority. We use university email verification, secure data handling, and privacy-first 
                design principles to ensure Lostology remains a trusted platform for the entire campus community.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Continuous Improvement</h3>
              <p className="text-gray-600 leading-relaxed">
                We're always listening to user feedback and iterating on our platform. Regular updates and new features 
                are driven by real user needs and campus-specific challenges.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Lostology is designed to be accessible to everyone, regardless of technical ability or device. 
                Simple interfaces and clear navigation ensure anyone can effectively use our platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-cornflower-blue rounded-2xl text-white p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or want to get involved? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-victory-green px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;