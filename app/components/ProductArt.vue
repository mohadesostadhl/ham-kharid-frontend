<script setup lang="ts">
defineProps<{ visual: string; large?: boolean }>()
</script>
<template>
  <div :class="['product-art', visual, { large }]" aria-hidden="true">
    <div class="art-orbit"></div>
    <svg viewBox="0 0 320 240" role="presentation">
      <defs>
        <linearGradient id="paper" x1="0" x2="1">
          <stop stop-color="#b9804d" />
          <stop offset=".5" stop-color="#d5a874" />
          <stop offset="1" stop-color="#b7804e" />
        </linearGradient>
        <linearGradient id="glass" x1="0" x2="1">
          <stop stop-color="#556344" />
          <stop offset=".4" stop-color="#899467" />
          <stop offset="1" stop-color="#44573c" />
        </linearGradient>
        <linearGradient id="amber" x1="0" x2="1">
          <stop stop-color="#ac621c" />
          <stop offset=".4" stop-color="#e4ad49" />
          <stop offset="1" stop-color="#c17a24" />
        </linearGradient>
        <filter id="shadow"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <ellipse
        cx="161"
        cy="215"
        rx="72"
        ry="9"
        fill="#182d24"
        opacity=".13"
        filter="url(#shadow)"
      />
      <g v-if="visual === 'coffee'" transform="rotate(-7 160 130)">
        <path d="M109 40 L210 40 L224 205 Q162 219 96 205 Z" fill="url(#paper)" />
        <path d="M110 40 L210 40 L205 53 L114 53 Z" fill="#855535" />
        <path d="M109 40 L100 58 L96 205 L110 194 Z" fill="#aa7445" />
        <path d="M113 84 L210 84 L215 174 L106 174 Z" fill="#f5f1e4" />
        <circle cx="161" cy="116" r="16" fill="none" stroke="#254b40" stroke-width="1.5" />
        <path
          d="M156 124 Q146 108 168 107 Q171 121 156 124 M156 124 L164 113"
          fill="none"
          stroke="#254b40"
          stroke-width="1.5"
        />
        <text
          x="161"
          y="148"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="17"
          letter-spacing="2"
          fill="#254b40"
        >
          SABZINEH
        </text>
        <text
          x="161"
          y="163"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="7"
          letter-spacing="3"
          fill="#647667"
        >
          DAILY COFFEE · 250g
        </text>
        <path d="M105 191 Q160 198 215 191" stroke="#94633e" fill="none" />
      </g>
      <g v-else-if="visual === 'olive'" transform="rotate(9 160 130)">
        <rect x="142" y="24" width="37" height="43" rx="4" fill="#293d2b" />
        <path
          d="M140 61 L181 61 L181 81 Q199 93 201 111 L201 202 Q161 217 120 202 L120 111 Q121 94 140 81 Z"
          fill="url(#glass)"
        />
        <rect x="125" y="117" width="71" height="69" rx="2" fill="#eeeacf" />
        <path
          d="M148 151 Q168 129 175 139 M155 150 Q143 130 145 129 M161 146 Q166 121 171 124"
          stroke="#63774d"
          stroke-width="3"
          fill="none"
        />
        <text
          x="161"
          y="170"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="12"
          fill="#3a5139"
        >
          OLIVA
        </text>
        <text
          x="161"
          y="180"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="5"
          letter-spacing="2"
          fill="#63774d"
        >
          EXTRA VIRGIN
        </text>
      </g>
      <g v-else-if="visual === 'honey' || visual === 'saffron'">
        <rect
          x="111"
          y="66"
          width="99"
          height="141"
          rx="20"
          :fill="visual === 'honey' ? 'url(#amber)' : '#8d3e36'"
        />
        <path
          d="M121 83 L121 189"
          stroke="white"
          opacity=".25"
          stroke-width="5"
          stroke-linecap="round"
        />
        <rect x="107" y="54" width="107" height="28" rx="6" fill="#d6b57a" />
        <path d="M113 60 H208 M113 66 H208 M113 72 H208" stroke="#a88a52" opacity=".6" />
        <rect x="112" y="114" width="97" height="62" fill="#f4edda" />
        <path
          d="M150 136 L160 130 L170 136 L170 148 L160 154 L150 148 Z"
          fill="none"
          stroke="#a0793f"
          stroke-width="1.5"
        />
        <text
          x="160"
          y="165"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="10"
          letter-spacing="1.4"
          fill="#78522e"
        >
          {{ visual === 'honey' ? 'WILD HONEY' : 'SAFFRON' }}
        </text>
      </g>
      <g v-else-if="visual === 'tea'">
        <rect x="104" y="65" width="112" height="141" rx="9" fill="#5d7863" />
        <ellipse cx="160" cy="66" rx="56" ry="13" fill="#8ca18b" />
        <ellipse cx="160" cy="63" rx="50" ry="10" fill="#b5bda1" />
        <rect x="111" y="100" width="98" height="78" fill="#e7e7cd" />
        <path
          d="M148 139 Q154 109 178 119 Q173 147 148 139 M145 148 L169 126"
          stroke="#5d7863"
          stroke-width="2"
          fill="none"
        />
        <text
          x="160"
          y="163"
          text-anchor="middle"
          font-family="Georgia,serif"
          font-size="13"
          fill="#3b5744"
        >
          LAHIJAN
        </text>
        <text
          x="160"
          y="173"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="5"
          letter-spacing="2"
          fill="#3b5744"
        >
          SPRING TEA
        </text>
      </g>
      <g v-else>
        <path
          d="M201 109 Q262 101 244 160 Q230 188 201 178"
          stroke="#ae7958"
          stroke-width="16"
          fill="none"
        />
        <path d="M100 91 H210 L203 191 Q158 222 108 191 Z" fill="#c79b79" />
        <path d="M100 91 H210 L206 123 Q155 139 103 122 Z" fill="#e0c7a7" />
        <ellipse cx="155" cy="91" rx="55" ry="13" fill="#f0dcc2" />
        <ellipse cx="155" cy="91" rx="48" ry="9" fill="#a87a55" />
      </g>
      <g v-if="visual === 'coffee'" fill="#5b3929">
        <ellipse cx="77" cy="204" rx="8" ry="5" transform="rotate(-30 77 204)" />
        <ellipse cx="241" cy="198" rx="7" ry="5" transform="rotate(20 241 198)" />
        <ellipse cx="225" cy="214" rx="6" ry="4" />
        <path d="M73 207 L80 201 M237 196 L245 200" stroke="#a77752" stroke-width="1" />
      </g>
    </svg>
    <span class="art-caption">{{
      visual === 'ceramic' ? 'MADE WITH CARE' : 'FROM NATURE, TOGETHER'
    }}</span>
  </div>
</template>
