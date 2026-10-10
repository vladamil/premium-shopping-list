import styles from './ContourLines.module.css';

// Map-style contour lines in the top-right corner (Lists and Settings pages).
// Pure decoration, so screen readers skip it (aria-hidden).
export function ContourLines() {
  return (
    <svg
      className={styles.lines}
      width="300"
      height="240"
      viewBox="0 0 260 220"
      aria-hidden="true"
    >
      <path d="M128 14 C196 2 262 42 254 112 C246 180 178 214 112 202 C46 190 10 140 30 84 C46 40 80 22 128 14 Z" />
      <path d="M130 40 C180 30 230 60 225 110 C220 160 170 185 120 175 C70 165 40 130 55 90 C68 58 95 46 130 40 Z" />
      <path d="M130 62 C168 55 205 78 201 112 C197 148 160 165 124 158 C88 151 66 126 77 97 C86 74 104 66 130 62 Z" />
      <path d="M131 84 C156 80 180 95 177 117 C174 139 152 148 129 144 C106 140 93 125 100 107 C106 93 115 87 131 84 Z" />
      <path d="M132 104 C144 102 156 109 154 119 C152 129 142 133 131 131 C120 129 114 122 117 114 C120 108 124 105 132 104 Z" />
    </svg>
  );
}
