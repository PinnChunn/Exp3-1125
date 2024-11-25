import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Award, Brain, Globe, Book, Share2, Check, Copy, ExternalLink, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getEvent, isUserRegistered, registerForEvent, Event } from '../lib/events';
import { getCurrentUser } from '../lib/auth';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const { event: eventData, error } = await getEvent(id, currentUser?.id);
      
      if (error) {
        console.error('Error fetching event:', error);
        return;
      }

      if (eventData) {
        setEvent(eventData);
        if (currentUser) {
          const { isRegistered } = await isUserRegistered(id, currentUser.id);
          setIsRegistered(isRegistered);
        }
      }
      
      setLoading(false);
    };

    fetchEventDetails();
  }, [id]);

  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: event.title,
      text: `Check out "${event.title}" on EXP3`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipboardErr) {
        console.error('Failed to copy to clipboard:', clipboardErr);
      }
    }
  };

  const handleRegistration = async () => {
    if (!event || !user || !id) return;
    
    const { error } = await registerForEvent(id, user.id);
    if (!error) {
      setIsRegistered(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const { instructor } = event;

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors duration-300 flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Share</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span>{event.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>{event.registeredUsers?.length || 0}/{event.attendeeLimit} seats</span>
                  </div>
                </div>

                {isRegistered && event.meetingLink && (
                  <div className="mb-8 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-700">Meeting Link:</span>
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:text-green-800 underline flex items-center gap-1"
                      >
                        Join Meeting <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="prose max-w-none">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Learning Outcomes</h2>
                  <ul className="space-y-3">
                    {event.learningOutcomes?.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {event.requirements?.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Registration Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">Free Event</div>
                <div className="text-gray-500">{event.xp} XP</div>
              </div>
              
              {isRegistered ? (
                <div className="w-full py-3 bg-green-100 text-green-600 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Registered</span>
                </div>
              ) : (
                <button 
                  onClick={handleRegistration}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 mb-4"
                  disabled={!user || event.registeredUsers?.length >= event.attendeeLimit}
                >
                  {!user ? 'Sign in to Register' : 
                   event.registeredUsers?.length >= event.attendeeLimit ? 'Sold Out' : 
                   'Register Now'}
                </button>
              )}

              <div className="text-sm text-gray-500 text-center">
                {event.attendeeLimit - (event.registeredUsers?.length || 0)} spots remaining
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={instructor.avatar}
                  alt={instructor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold">{instructor.name}</h3>
                  <p className="text-gray-600">{instructor.role}</p>
                </div>
              </div>

              {instructor.stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="font-bold">{instructor.stats.courses}</div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{instructor.stats.articles}</div>
                    <div className="text-sm text-gray-600">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{instructor.stats.students}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {instructor.bio.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-sm text-gray-600">{paragraph}</p>
                ))}
              </div>

              {instructor.expertise && (
                <div className="space-y-2">
                  <h4 className="font-medium mb-3">Expertise</h4>
                  {instructor.expertise.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="space-y-3">
                  {instructor.linkedin && (
                    <a 
                      href={instructor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Globe className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {instructor.email && (
                    <a 
                      href={`mailto:${instructor.email}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{instructor.email}</span>
                    </a>
                  )}
                  {instructor.medium && (
                    <a 
                      href={instructor.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Book className="w-4 h-4" />
                      <span>Medium</span>
                    </a>
                  )}
                  {instructor.website && (
                    <a 
                      href={instructor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}