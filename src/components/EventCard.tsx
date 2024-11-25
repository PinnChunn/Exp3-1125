import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  Tag,
  Users,
  Check,
  ExternalLink,
  Share2,
  Video,
  Sparkles,
  Timer
} from 'lucide-react';
import { logUserActivity } from '../lib/firebase';

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  time: string;
  tags: string[];
  skills: string[];
  description: string;
  imageUrl: string;
  onRegister: () => void;
  externalLink?: string;
  isAuthenticated: boolean;
  isRegistered: boolean;
  meetingLink?: string;
  xp?: number;
  duration?: string;
  participants?: number;
}

export default function EventCard({
  id,
  title,
  date,
  time,
  tags,
  skills,
  description,
  imageUrl,
  onRegister,
  externalLink,
  isAuthenticated,
  isRegistered,
  meetingLink,
  xp,
  duration,
  participants
}: EventCardProps) {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (id) {
      logUserActivity.viewEvent(id, title);
    }
  }, [id, title]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = externalLink || (id ? window.location.origin + '/events/' + id : window.location.href);
    const shareData = {
      title: title,
      text: `Check out "${title}" on EXP3`,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        if (id) {
          logUserActivity.shareEvent(id, 'native_share');
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        if (id) {
          logUserActivity.shareEvent(id, 'copy_link');
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        if (id) {
          logUserActivity.shareEvent(id, 'copy_link');
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipboardErr) {
        console.error('Failed to copy to clipboard:', clipboardErr);
      }
    }
  };

  const getButtonConfig = () => {
    if (isRegistered && meetingLink) {
      return {
        text: 'Join Meeting',
        icon: Video,
        className: 'bg-green-600 hover:bg-green-700 text-white',
        disabled: false,
        onClick: () => {
          window.open(meetingLink, '_blank', 'noopener,noreferrer');
          if (id) {
            logUserActivity.pageView('meeting_join');
          }
        }
      };
    }

    if (isRegistered) {
      return {
        text: 'Registered',
        icon: Check,
        className: 'bg-purple-100 text-purple-600 cursor-default',
        disabled: true,
        onClick: undefined
      };
    }

    if (externalLink) {
      return {
        text: 'Register on Lu.ma',
        icon: ExternalLink,
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
        disabled: false,
        onClick: () => {
          window.open(externalLink, '_blank', 'noopener,noreferrer');
          if (id) {
            logUserActivity.pageView('external_registration');
          }
        }
      };
    }

    if (!isAuthenticated) {
      return {
        text: 'Connect to Register',
        icon: Users,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        disabled: false,
        onClick: onRegister
      };
    }

    return {
      text: 'Register Now',
      icon: Calendar,
      className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      disabled: false,
      onClick: onRegister
    };
  };

  const buttonConfig = getButtonConfig();

  const handleCardClick = () => {
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
      if (id) {
        logUserActivity.pageView('external_link_click');
      }
      return;
    }
    
    if (id) {
      navigate(`/events/${id}`);
      logUserActivity.pageView('event_detail');
    }
  };

  return (
    <div className="relative h-full">
      <div className="bg-white rounded-xl shadow-lg transition-all duration-300 h-full flex flex-col hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={handleCardClick}>
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden group rounded-t-xl">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Share Button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors duration-300 flex items-center gap-2"
              aria-label="Share event"
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
        </div>

        {/* Content Container */}
        <div className="p-6 flex-grow flex flex-col">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm flex items-center gap-1 hover:bg-indigo-100 transition-colors cursor-default group"
              >
                <Tag className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-gray-800 hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          
          {/* Event Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-sm">{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm">{time}</span>
              </div>
            </div>
            {duration && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Timer className="w-4 h-4 text-indigo-600" />
                <span className="text-sm">{duration}</span>
              </div>
            )}
            {participants && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm">{participants} participants</span>
              </div>
            )}
            {xp && (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium">{xp} XP</span>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Skills you'll gain:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Meeting Link for Registered Users */}
          {isRegistered && meetingLink && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Meeting Link:</span>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-800 underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Meeting <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          <div className="mt-auto">
            {/* Button Container */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  buttonConfig.onClick ? buttonConfig.onClick() : onRegister();
                }}
                disabled={buttonConfig.disabled}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2 min-w-[140px] justify-center ${buttonConfig.className}`}
              >
                <buttonConfig.icon className={`w-4 h-4 ${isRegistered ? '' : 'group-hover:rotate-12 transition-transform'}`} />
                {buttonConfig.text}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}