import React from 'react';

export type AssistantPose =
  | 'welcome'
  | 'explain'
  | 'agree'
  | 'think'
  | 'listen';
export interface FigureMotion {
  mouth?: number;
  head?: number;
  hand?: number;
  bob?: number;
  blink?: number;
  thought?: number;
}

/** Kabir's existing headphones, mug and open palm, drawn as a small vector rig.
 * The live renderer and video exporter share this artwork. No bitmap morphing.
 */
export function AssistantFigure({
  pose = 'listen',
  motion = {},
  label,
  idPrefix = 'kabir',
}: {
  pose?: AssistantPose;
  motion?: FigureMotion;
  label?: string;
  idPrefix?: string;
}) {
  const mouth = Math.max(0, Math.min(1, motion.mouth || 0));
  const thinking = pose === 'think';
  const hand =
    pose === 'explain'
      ? 'M225 216Q228 189 248 176L267 142Q273 132 281 138Q288 143 281 156L274 171Q292 158 300 167Q307 178 293 191L273 213Q253 237 235 242'
      : pose === 'agree'
      ? 'M235 245Q212 239 205 218L195 197Q191 187 198 183Q205 178 211 190L216 199L222 178Q225 167 233 171Q241 174 237 187L235 196Q252 187 260 197Q267 208 250 223L245 231'
      : thinking
      ? 'M231 244Q220 224 218 201L206 173Q199 161 207 157Q216 152 224 166L230 175Q230 160 239 162Q249 164 244 181L251 199Q261 226 243 245'
      : 'M230 226Q233 199 248 181Q256 170 262 177Q269 184 263 194Q280 188 287 177Q293 169 301 175Q308 184 298 195Q313 186 315 197Q318 208 304 218L275 234Q255 251 236 247';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 300"
      className="assistant-figure"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <ellipse cx="165" cy="280" rx="87" ry="9" fill="#D8DED4" opacity=".65" />
      <g
        transform={`translate(0 ${motion.bob || 0})`}
        fill="#FAFBF7"
        stroke="#242523"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M115 173Q83 186 73 226Q68 259 96 273Q163 295 230 272Q252 258 247 226Q239 185 214 175Z" />
        <path
          d="M121 181Q163 198 207 180"
          fill="none"
          stroke="#D8DED4"
          strokeWidth="3"
        />
        <g
          className="assistant-hand"
          transform={`rotate(${motion.hand || 0} 236 211)`}
        >
          <path d={hand} />
          {pose === 'welcome' && (
            <path
              d="M264 196L270 207M286 196L290 205"
              fill="none"
              strokeWidth="3"
            />
          )}
        </g>
        <path d="M72 214Q51 205 40 223Q26 247 47 260Q62 272 78 251" />
        <g className="assistant-mug">
          <path
            d="M104 223Q125 220 123 236Q121 250 103 249"
            fill="none"
            strokeWidth="6"
          />
          <path d="M59 216L63 255Q83 271 106 254L109 216Z" fill="#B2BBAA" />
          <ellipse cx="84" cy="216" rx="25" ry="8" fill="#D8DED4" />
          <ellipse
            cx="84"
            cy="216"
            rx="18"
            ry="4"
            fill="#343632"
            stroke="none"
          />
          <path
            className="assistant-steam"
            d="M74 201Q64 192 74 182M89 202Q101 193 89 181"
            stroke="#92998F"
            strokeWidth="3"
            fill="none"
          />
        </g>
        <g
          className="assistant-head"
          transform={`rotate(${motion.head || 0} 165 126)`}
        >
          <path
            d="M86 104Q82 28 164 25Q246 26 249 111"
            fill="none"
            stroke="#242523"
            strokeWidth="16"
          />
          <path
            d="M86 104Q83 27 164 25Q246 26 249 111"
            fill="none"
            stroke="#697066"
            strokeWidth="5"
          />
          <ellipse cx="90" cy="121" rx="22" ry="38" fill="#697066" />
          <ellipse
            cx="94"
            cy="121"
            rx="14"
            ry="31"
            fill="#B2BBAA"
            strokeWidth="4"
          />
          <path d="M105 76Q122 41 165 43Q213 42 236 84Q253 117 235 153Q216 188 171 191Q120 193 102 155Q87 122 105 76Z" />
          <path
            d={
              thinking
                ? 'M126 91L143 86M186 87L202 91'
                : 'M126 91Q133 83 143 86M186 87Q196 87 202 96'
            }
            strokeWidth="5"
            fill="none"
          />
          <g
            className="assistant-eyes"
            transform={`translate(165 112) scale(1 ${
              motion.blink ?? 1
            }) translate(-165 -112)`}
          >
            {thinking ? (
              <>
                <ellipse
                  cx="137"
                  cy="111"
                  rx="6"
                  ry="7"
                  fill="#242523"
                  stroke="none"
                />
                <ellipse
                  cx="191"
                  cy="111"
                  rx="6"
                  ry="7"
                  fill="#242523"
                  stroke="none"
                />
              </>
            ) : (
              <path
                d="M125 112Q135 99 146 113M181 113Q192 102 204 117"
                fill="none"
                strokeWidth="6"
              />
            )}
          </g>
          <path
            className="assistant-smile"
            d={
              thinking ? 'M154 143Q164 138 172 141' : 'M150 137Q166 154 183 138'
            }
            opacity={mouth > 0.08 ? 0 : 1}
            fill="none"
            strokeWidth="5.5"
          />
          {mouth > 0.08 && (
            <g className="assistant-mouth">
              <defs>
                <clipPath id={`${idPrefix}-mouth`}>
                  <ellipse cx="167" cy="142" rx="14" ry={3 + mouth * 11} />
                </clipPath>
              </defs>
              <ellipse
                cx="167"
                cy="142"
                rx="14"
                ry={3 + mouth * 11}
                fill="#242523"
                strokeWidth="3"
              />
              <g clipPath={`url(#${idPrefix}-mouth)`} stroke="none">
                <path d="M155 129H179L177 138H157Z" fill="#FAFBF7" />
                <ellipse cx="168" cy="156" rx="12" ry="7" fill="#B2BBAA" />
              </g>
            </g>
          )}
          <ellipse cx="245" cy="128" rx="22" ry="38" fill="#697066" />
          <ellipse
            cx="246"
            cy="128"
            rx="15"
            ry="30"
            fill="#B2BBAA"
            strokeWidth="4"
          />
        </g>
      </g>
      {thinking && (
        <g
          className="assistant-thought"
          fill="#FAFBF7"
          stroke="#242523"
          strokeWidth="3"
        >
          <circle cx="251" cy="66" r="5" />
          <circle cx="267" cy="52" r="7" />
          <rect x="256" y="8" width="57" height="34" rx="16" />
          {[0, 1, 2].map(i => (
            <circle
              key={i}
              className={`thought-dot dot-${i}`}
              cx={270 + i * 14}
              cy="25"
              r="3"
              stroke="none"
              fill="#242523"
              opacity={
                motion.thought === undefined
                  ? 1
                  : 0.25 +
                    0.75 *
                      ((Math.sin(motion.thought * 2 * Math.PI - i * 1.3) + 1) /
                        2)
              }
            />
          ))}
        </g>
      )}
    </svg>
  );
}
