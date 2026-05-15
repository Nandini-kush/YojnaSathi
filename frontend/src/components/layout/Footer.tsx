import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Github, Linkedin, Twitter } from 'lucide-react';
import Logo from '@/components/common/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-sm text-gray-400">
              Simplifying government scheme eligibility checking for all Indians.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/schemes" className="hover:text-blue-400 transition">
                  Browse Schemes
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-blue-400 transition">
                  Check Eligibility
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-blue-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-blue-400 transition">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-400" />
                <a href="mailto:info@yojnasathi.com" className="hover:text-blue-400 transition">
                  info@yojnasathi.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-blue-400" />
                <span>+91-XXXX-XXXX-XX</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-blue-400 mt-1" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-700 pt-8 pb-8">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition"
              aria-label="GitHub"
            >
              <Github size={24} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition"
              aria-label="Twitter"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-gray-400 text-sm">
            <p>
              &copy; {currentYear} YojnaSathi. All rights reserved. | Made with ❤️ in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
