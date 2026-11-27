"use client";

import { useId } from "react";

interface OBIsotipoProps {
  size?: number;
  className?: string;
}

export default function OBIsotipo({ size = 32, className = "" }: OBIsotipoProps) {
  const uid = useId().replace(/:/g, "-");
  const c0 = `ob-cv0${uid}`;
  const c1 = `ob-cv1${uid}`;
  const c2 = `ob-cv2${uid}`;
  const cm = `ob-cvm${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="28 -745 790 790"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={c0}>
          <polygon points="422.9,-350 422.9,-1550 631.3,-1531.8 833.3,-1477.6 1022.9,-1389.2 1194.2,-1269.3 1342.2,-1121.3 1462.1,-950 1550.5,-760.4 1604.7,-558.4 1622.9,-350 1604.7,-141.6 1550.5,60.4 1462.1,250" />
        </clipPath>
        <clipPath id={c1}>
          <polygon points="422.9,-350 1462.1,250 1342.2,421.3 1194.2,569.3 1022.9,689.2 833.3,777.6 631.3,831.8 422.9,850 214.5,831.8 12.5,777.6 -177.1,689.2 -348.4,569.3 -496.4,421.3 -616.3,250" />
        </clipPath>
        <clipPath id={c2}>
          <polygon points="422.9,-350 -616.3,250 -704.7,60.4 -758.9,-141.6 -777.1,-350 -758.9,-558.4 -704.7,-760.4 -616.3,-950 -496.4,-1121.3 -348.4,-1269.3 -177.1,-1389.2 12.5,-1477.6 214.5,-1531.8 422.9,-1550" />
        </clipPath>
        <mask id={cm} maskUnits="userSpaceOnUse" x="-177" y="-850" width="1200" height="1000">
          <rect x="-177" y="-850" width="1200" height="1000" fill="#fff" />
          <line x1="422.9" y1="-350" x2="422.9" y2="-1550" stroke="#000" strokeWidth="40" />
          <line x1="422.9" y1="-350" x2="1462.1" y2="250" stroke="#000" strokeWidth="40" />
          <line x1="422.9" y1="-350" x2="-616.3" y2="250" stroke="#000" strokeWidth="40" />
        </mask>
      </defs>
      <g mask={`url(#${cm})`}>
        <path
          d="M34.3,-350a388.6,363.8 0 1,0 777.3,0a388.6,363.8 0 1,0 -777.3,0ZM294.3,-350a128.6,150.6 0 1,0 257.3,0a128.6,150.6 0 1,0 -257.3,0Z"
          fillRule="evenodd"
          fill="#E4572E"
          clipPath={`url(#${c0})`}
        />
        <path
          d="M34.3,-350a388.6,363.8 0 1,0 777.3,0a388.6,363.8 0 1,0 -777.3,0ZM294.3,-350a128.6,150.6 0 1,0 257.3,0a128.6,150.6 0 1,0 -257.3,0Z"
          fillRule="evenodd"
          fill="#F4C21B"
          clipPath={`url(#${c1})`}
        />
        <path
          d="M34.3,-350a388.6,363.8 0 1,0 777.3,0a388.6,363.8 0 1,0 -777.3,0ZM294.3,-350a128.6,150.6 0 1,0 257.3,0a128.6,150.6 0 1,0 -257.3,0Z"
          fillRule="evenodd"
          fill="#2E9E4F"
          clipPath={`url(#${c2})`}
        />
      </g>
    </svg>
  );
}
