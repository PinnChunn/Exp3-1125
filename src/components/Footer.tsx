import React from 'react';
import { Mail } from 'lucide-react';

const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
          {/* Logo Section */}
          <div>
            <div className="text-3xl font-bold text-gray-900">
              EXP3
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl text-gray-900 mb-4">Contact Us</h3>
            <a 
              href="mailto:expthree2024@gmail.com"
              className="text-gray-600 hover:text-gray-800 transition-colors duration-300 flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              expthree2024@gmail.com
            </a>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-xl text-gray-900 mb-4">Follow Us</h3>
            <div className="space-y-2">
              <div>
                <SocialLink href="https://line.me/ti/g2/Jg53vbIohGq9iwiATxoQAh-jFKENtdLz5Rk-Ww">
                  LINE
                </SocialLink>
              </div>
              <div>
                <SocialLink href="https://discord.gg/kYRh34v9Ra">
                  Discord
                </SocialLink>
              </div>
              <div>
                <SocialLink href="https://t.me/meta_ux">
                  Telegram
                </SocialLink>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} EXP3. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}