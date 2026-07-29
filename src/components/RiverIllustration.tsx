interface Props {
  variant: "culvert" | "eco";
  title: string;
}

// 같은 하천의 서로 다른 두 모습을 표현하는 단순 일러스트입니다.
// culvert: 복개(콘크리트로 덮어 도로/주차장이 된) 구간
// eco: 생태하천으로 복원된 구간
export default function RiverIllustration({ variant, title }: Props) {
  return (
    <figure className="river-illustration">
      <svg viewBox="0 0 400 240" role="img" aria-label={title}>
        {variant === "culvert" ? <CulvertScene /> : <EcoScene />}
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

function CulvertScene() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="240" fill="#dfe3e6" />
      <rect x="0" y="150" width="400" height="90" fill="#b9c0c6" />
      <rect x="0" y="150" width="400" height="6" fill="#9aa3aa" />
      {[40, 120, 200, 280, 360].map((x) => (
        <rect key={x} x={x} y="190" width="34" height="8" fill="#eef1f2" />
      ))}
      <circle cx="90" cy="175" r="9" fill="#8b939a" />
      <circle cx="90" cy="175" r="4" fill="#6b7278" />
      <circle cx="230" cy="205" r="9" fill="#8b939a" />
      <circle cx="230" cy="205" r="4" fill="#6b7278" />
      <g>
        <rect x="30" y="90" width="70" height="60" fill="#aeb6bc" />
        <rect x="120" y="70" width="55" height="80" fill="#9ba3aa" />
        <rect x="300" y="80" width="80" height="70" fill="#aeb6bc" />
        {[40, 55, 70, 85].map((x) => (
          <rect key={x} x={x} y="100" width="8" height="10" fill="#dfe3e6" />
        ))}
      </g>
      <rect x="205" y="120" width="6" height="70" fill="#6b7278" />
      <circle cx="208" cy="112" r="10" fill="#f2c94c" />
      <rect x="150" y="150" width="26" height="16" fill="#c9432f" />
      <circle cx="158" cy="169" r="5" fill="#333" />
      <circle cx="170" cy="169" r="5" fill="#333" />
      <rect x="260" y="150" width="30" height="18" fill="#2f6fb0" />
      <circle cx="267" cy="171" r="5" fill="#333" />
      <circle cx="281" cy="171" r="5" fill="#333" />
    </g>
  );
}

function EcoScene() {
  return (
    <g>
      <rect x="0" y="0" width="400" height="240" fill="#d7ecdd" />
      <path d="M0 150 C60 130 100 170 160 150 C220 130 260 170 320 150 C350 140 380 150 400 145 L400 240 L0 240 Z" fill="#5a9c6b" />
      <path
        d="M0 190 C50 160 90 200 150 180 C210 160 250 200 300 180 C340 165 370 185 400 178 L400 240 L0 240 Z"
        fill="#3f8cc4"
      />
      <path
        d="M0 200 C50 178 90 210 150 195 C210 178 250 210 300 195 C340 183 370 198 400 192 L400 240 L0 240 Z"
        fill="#5aa6d6"
        opacity="0.7"
      />
      {[
        { x: 40, y: 120 },
        { x: 90, y: 100 },
        { x: 320, y: 110 },
        { x: 360, y: 130 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <rect x="-3" y="10" width="6" height="20" fill="#6b4a2f" />
          <circle cx="0" cy="0" r="18" fill="#4c8f57" />
          <circle cx="-12" cy="8" r="12" fill="#5aa066" />
          <circle cx="12" cy="8" r="12" fill="#5aa066" />
        </g>
      ))}
      {[70, 140, 250].map((x, i) => (
        <path
          key={i}
          d={`M${x} 200 q4 -14 0 -22`}
          stroke="#3f7d4a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <g transform="translate(190,70)">
        <path d="M0 10 Q10 -5 20 10" stroke="#e8985a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="8" r="4" fill="#e8985a" />
      </g>
      <g transform="translate(240,55)">
        <path d="M0 8 Q8 -4 16 8" stroke="#e8985a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="330" cy="40" r="20" fill="#f6d365" opacity="0.9" />
    </g>
  );
}
