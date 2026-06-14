/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface GiaKhanhLogoProps {
  className?: string;
  size?: number;
}

export default function GiaKhanhLogo({ className = '', size = 120 }: GiaKhanhLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shadow-md rounded-xl ${className}`}
    >
      {/* Red Background */}
      <rect width="500" height="500" fill="#EE3124" />

      {/* Elegant Gold traditional corners */}
      {/* Top Left Corner */}
      <path d="M15 15H100V25H25V100H15V15Z" fill="#FFE600" />
      <circle cx="35" cy="35" r="8" fill="#FFE600" />
      <path d="M45 15C45 31.5 31.5 45 15 45" stroke="#FFE600" strokeWidth="2" fill="none" />
      <path d="M75 15C75 48.1 48.1 75 15 75" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Top Right Corner */}
      <path d="M485 15H400V25H475V100H485V15Z" fill="#FFE600" />
      <circle cx="465" cy="35" r="8" fill="#FFE600" />
      <path d="M455 15C455 31.5 468.5 45 485 45" stroke="#FFE600" strokeWidth="2" fill="none" />
      <path d="M425 15C425 48.1 451.9 75 485 75" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Bottom Left Corner */}
      <path d="M15 485H100V475H25V400H15V485Z" fill="#FFE600" />
      <circle cx="35" cy="465" r="8" fill="#FFE600" />
      <path d="M45 485C45 468.5 31.5 455 15 455" stroke="#FFE600" strokeWidth="2" fill="none" />
      <path d="M75 485C75 451.9 48.1 425 15 425" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Bottom Right Corner */}
      <path d="M485 485H400V475H475V400H485V485Z" fill="#FFE600" />
      <circle cx="465" cy="465" r="8" fill="#FFE600" />
      <path d="M455 485C455 468.5 468.5 455 485 455" stroke="#FFE600" strokeWidth="2" fill="none" />
      <path d="M425 485C425 451.9 451.9 425 485 425" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Inner Beaded Circle */}
      <circle cx="250" cy="235" r="190" stroke="#FFE600" strokeWidth="4" />
      <circle cx="250" cy="235" r="178" stroke="#FFE600" strokeWidth="1.5" strokeDasharray="5 4" />

      {/* Traditional general/emperor drawing simplified as premium vector art */}
      <g transform="translate(145, 100)">
        {/* Emperor hat (Mũ cánh chuồn / Mũ triều đình) */}
        <path d="M105 10C105 10 95 15 80 20C75 10 50 15 45 35C40 50 60 65 75 65C85 65 95 62 105 58C110 58 115 50 120 40C125 30 115 15 105 10Z" fill="#FFE600" />
        {/* Plum/feather spike on Top of hat */}
        <path d="M100 12L85 -18L103 -13L112 8L100 12Z" fill="#FFE600" fillOpacity="0.9" />
        <line x1="100" y1="12" x2="85" y2="-18" stroke="#EE3124" strokeWidth="2" />
        
        {/* Back panel of the traditional headpiece */}
        <path d="M115 25C130 20 145 35 140 50C135 60 120 62 112 58" fill="#FFE600" />

        {/* Head/Face profile looking to right */}
        <path d="M80 62C75 62 70 65 68 70C65 75 65 80 67 85C69 90 73 95 73 98C68 102 62 104 60 108C58 112 60 118 64 122C70 125 78 122 83 120C85 125 90 130 95 132C100 134 105 132 108 130" fill="#FFE600" />
        
        {/* Forehead, nose, lips silhouette details */}
        <path d="M103 58C103 62 110 68 110 72C110 75 105 78 108 82C110 85 116 87 114 91C112 94 106 94 104 98" stroke="#EE3124" strokeWidth="2" fill="none" />
        
        {/* Eye block */}
        <ellipse cx="94" cy="74" rx="6" ry="2.5" transform="rotate(-15 94 74)" fill="#EE3124" />
        <path d="M85 68C90 66 100 68 103 72" stroke="#EE3124" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Mustache traditional curled design */}
        <path d="M102 85C110 85 115 88 118 94C115 96 110 94 106 91C104 93 104 96 102 98C100 95 101 90 102 85Z" fill="#EE3124" />
        <path d="M107 88C114 88 124 92 126 99C121 101 116 97 112 93" stroke="#EE3124" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Long traditional Beard (Râu ba chòm) */}
        <path d="M96 100C96 100 98 115 104 125C108 130 112 120 110 112C105 108 100 102 96 100Z" fill="#EE3124" />
        <path d="M102 98C102 108 108 118 112 122" stroke="#EE3124" strokeWidth="1.5" />

        {/* Hair drapery back */}
        <path d="M72 65C62 75 60 90 62 105C64 110 68 110 68 105C66 95 70 80 76 70L72 65Z" fill="#EE3124" />

        {/* Neck and collar */}
        <path d="M80 110C83 115 86 122 88 130H100C101 122 102 115 104 110" fill="#FFE600" />
        
        {/* Armor robe (Giáp cổ tròn truyền thống) */}
        <path d="M42 125C30 135 15 150 10 170H140C130 150 115 135 103 125C98 128 88 128 83 125C78 128 68 128 63 125C58 128 48 128 42 125Z" fill="#FFE600" />
        
        {/* Cross shoulder band garment line details */}
        <path d="M45 125L83 170" stroke="#EE3124" strokeWidth="3" />
        <path d="M100 125L60 170" stroke="#EE3124" strokeWidth="3" fill="none" />
        
        {/* Ancient shoulder armor plates (Giáp vai tả hữu) */}
        <path d="M10 170C10 170 15 195 28 205C40 195 50 170 50 170" fill="#FFE600" />
        <path d="M85 170C85 170 95 195 107 205C120 195 125 170 125 170" fill="#FFE600" />
        <path d="M15 175C20 185 28 190 35 192" stroke="#EE3124" strokeWidth="1.5" fill="none" />
        <path d="M90 175C95 185 103 190 110 192" stroke="#EE3124" strokeWidth="1.5" fill="none" />
      </g>

      {/* Master typography brand name */}
      <text
        x="250"
        y="345"
        textAnchor="middle"
        fill="#FFE600"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontWeight="900"
        fontSize="54"
        letterSpacing="2"
      >
        GIA KHÁNH
      </text>

      {/* Sub-label banner */}
      <text
        x="250"
        y="383"
        textAnchor="middle"
        fill="#FFE600"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize="17"
        letterSpacing="5"
      >
        MUSHROOM HOTPOT
      </text>

      {/* Traditional horizontal lines separating the URL */}
      <line x1="120" y1="405" x2="380" y2="405" stroke="#FFE600" strokeWidth="2.5" />

      {/* Website Domain */}
      <text
        x="250"
        y="428"
        textAnchor="middle"
        fill="#FFE600"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="500"
        fontSize="14"
        letterSpacing="1"
      >
        www.launamgiakhanh.vn
      </text>
    </svg>
  );
}
