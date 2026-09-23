import React from 'react';
import { 
  Sparkles, 
  Shield, 
  Sword, 
  Crown, 
  Flame, 
  User, 
  Layout, 
  Box, 
  Zap, 
  Hammer, 
  Settings, 
  Terminal,
  BookOpen,
  Heart
} from 'lucide-react';

// Registry of custom tokens and their custom renderers
export const CUSTOM_ICONS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ':worldbox:': {
    label: 'WorldBox',
    color: '#00d26a',
    icon: <Box className="inline-block w-4 h-4 mr-1 text-emerald-400 align-text-bottom" />
  },
  ':nml:': {
    label: 'NeoModLoader',
    color: '#3b82f6',
    icon: <Zap className="inline-block w-4 h-4 mr-1 text-blue-400 align-text-bottom" />
  },
  ':ncms:': {
    label: 'NCMS',
    color: '#8b5cf6',
    icon: <Terminal className="inline-block w-4 h-4 mr-1 text-purple-400 align-text-bottom" />
  },
  ':actor:': {
    label: 'Actor',
    color: '#ec4899',
    icon: <User className="inline-block w-4 h-4 mr-1 text-pink-400 align-text-bottom" />
  },
  ':sword:': {
    label: 'Weapon',
    color: '#ef4444',
    icon: <Sword className="inline-block w-4 h-4 mr-1 text-red-400 align-text-bottom" />
  },
  ':shield:': {
    label: 'Defense',
    color: '#3b82f6',
    icon: <Shield className="inline-block w-4 h-4 mr-1 text-blue-400 align-text-bottom" />
  },
  ':crown:': {
    label: 'Kingdom',
    color: '#f59e0b',
    icon: <Crown className="inline-block w-4 h-4 mr-1 text-amber-400 align-text-bottom" />
  },
  ':trait:': {
    label: 'Trait',
    color: '#10b981',
    icon: <Sparkles className="inline-block w-4 h-4 mr-1 text-emerald-400 align-text-bottom" />
  },
  ':fire:': {
    label: 'Power',
    color: '#f97316',
    icon: <Flame className="inline-block w-4 h-4 mr-1 text-orange-400 align-text-bottom" />
  },
  ':window:': {
    label: 'UI Window',
    color: '#06b6d4',
    icon: <Layout className="inline-block w-4 h-4 mr-1 text-cyan-400 align-text-bottom" />
  },
  ':craft:': {
    label: 'Crafting',
    color: '#d97706',
    icon: <Hammer className="inline-block w-4 h-4 mr-1 text-amber-500 align-text-bottom" />
  },
  ':mod:': {
    label: 'Modding',
    color: '#6366f1',
    icon: <Settings className="inline-block w-4 h-4 mr-1 text-indigo-400 align-text-bottom" />
  },
  ':book:': {
    label: 'Guide',
    color: '#64748b',
    icon: <BookOpen className="inline-block w-4 h-4 mr-1 text-slate-400 align-text-bottom" />
  },
  ':heart:': {
    label: 'Life',
    color: '#e11d48',
    icon: <Heart className="inline-block w-4 h-4 mr-1 text-rose-500 align-text-bottom" />
  }
};

/**
 * Parses a string and transforms custom token syntax like :worldbox: or :actor:
 * into custom icon badges or SVG elements, keeping regular text and unicode emojis intact.
 */
export function parseCustomEmojis(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex that captures tokens surrounded by colons: :token:
  const tokenRegex = /(:[a-zA-Z0-9_-]+:)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (CUSTOM_ICONS[part]) {
      const item = CUSTOM_ICONS[part];
      return (
        <span 
          key={index} 
          className="custom-emoji-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
          style={{ 
            backgroundColor: `${item.color}20`, 
            color: item.color,
            border: `1px solid ${item.color}40`,
            verticalAlign: 'middle',
            margin: '0 2px'
          }}
          title={item.label}
        >
          {item.icon}
          <span>{part.replace(/:/g, '')}</span>
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
