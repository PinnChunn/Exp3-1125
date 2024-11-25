import React from 'react';
import { Shield, BookOpen, Library } from 'lucide-react';

const benefits = [
  {
    title: 'Record Every Step',
    description: 'Transform your learning journey into verifiable achievements. Each workshop, seminar, and project becomes a permanent part of your professional story.',
    icon: Shield,
    gradient: 'from-purple-600 to-indigo-600',
    animation: 'animate-float'
  },
  {
    title: 'Connect the Dots',
    description: 'Build a comprehensive portfolio that showcases your growth. Link different skills and experiences to demonstrate your unique professional narrative.',
    icon: BookOpen,
    gradient: 'from-indigo-600 to-blue-600',
    animation: 'animate-progress'
  },
  {
    title: 'Stay Current',
    description: 'Keep your skills sharp and relevant. Access cutting-edge workshops and earn credentials that reflect your engagement with the latest industry trends.',
    icon: Library,
    gradient: 'from-blue-600 to-cyan-600',
    animation: 'animate-door'
  }
];

export default function Benefits() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }} />
      
      <div className="container mx-auto px-6 relative">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Certification Benefits
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="relative group h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl transform group-hover:scale-105 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col">
                <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-r ${benefit.gradient} p-4 text-white shadow-lg ${benefit.animation}`}>
                  <benefit.icon className="w-full h-full" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent min-h-[2rem] flex items-center">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {benefit.description}
                </p>

                <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mt-6 transform origin-left transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}