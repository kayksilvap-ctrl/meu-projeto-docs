<template>
  <div class="logo-container" :style="{ width: size + 'px' }">
    <!-- Símbolo do Anjo -->
    <svg
      :width="size"
      :height="size * 1.15"
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Asa esquerda - 4 camadas -->
      <g>
        <!-- Camada 1 (fundo) -->
        <path
          d="M98 80 C70 60 30 55 10 70 C5 73 2 80 8 85 C25 95 50 90 70 82 C50 78 30 70 20 78 C15 82 14 88 20 92 C40 100 65 96 85 88 C65 86 45 82 35 88 C30 91 30 96 36 100 C55 108 75 104 92 96 Z"
          fill="#D3D3D3"
          opacity="0.9"
        />
        <!-- Camada 2 -->
        <path
          d="M95 78 C72 56 38 48 18 58 C12 61 8 68 14 74 C32 86 56 82 74 74 C54 70 36 62 26 70 C20 75 20 82 28 86 C48 96 70 90 88 82 Z"
          fill="#D3D3D3"
          opacity="0.92"
        />
        <!-- Camada 3 -->
        <path
          d="M92 76 C74 52 44 40 24 48 C16 52 12 60 18 68 C36 82 60 78 78 68 C58 62 40 54 30 62 C24 68 26 76 34 80 C52 90 76 84 90 76 Z"
          fill="#D3D3D3"
          opacity="0.95"
        />
        <!-- Camada 4 (topo) -->
        <path
          d="M88 72 C72 46 42 34 22 42 C14 46 10 56 16 64 C32 78 56 74 76 64 C56 58 38 50 28 58 C22 64 24 72 32 76 C48 84 72 78 88 72 Z"
          fill="#E8E8E8"
        />
      </g>

      <!-- Asa direita - 4 camadas (espelhada) -->
      <g>
        <path
          d="M102 80 C130 60 170 55 190 70 C195 73 198 80 192 85 C175 95 150 90 130 82 C150 78 170 70 180 78 C185 82 186 88 180 92 C160 100 135 96 115 88 C135 86 155 82 165 88 C170 91 170 96 164 100 C145 108 125 104 108 96 Z"
          fill="#D3D3D3"
          opacity="0.9"
        />
        <path
          d="M105 78 C128 56 162 48 182 58 C188 61 192 68 186 74 C168 86 144 82 126 74 C146 70 164 62 174 70 C180 75 180 82 172 86 C152 96 130 90 112 82 Z"
          fill="#D3D3D3"
          opacity="0.92"
        />
        <path
          d="M108 76 C126 52 156 40 176 48 C184 52 188 60 182 68 C164 82 140 78 122 68 C142 62 160 54 170 62 C176 68 174 76 166 80 C148 90 124 84 110 76 Z"
          fill="#D3D3D3"
          opacity="0.95"
        />
        <path
          d="M112 72 C128 46 158 34 178 42 C186 46 190 56 184 64 C168 78 144 74 124 64 C144 58 162 50 172 58 C178 64 176 72 168 76 C152 84 128 78 112 72 Z"
          fill="#E8E8E8"
        />
      </g>

      <!-- Cabeça do anjo (círculo vermelho) -->
      <circle cx="100" cy="70" r="18" fill="#D90445" />

      <!-- Auréola dourada -->
      <ellipse cx="100" cy="46" rx="22" ry="6" stroke="#FFD700" stroke-width="2.5" fill="none" />

      <!-- Corpo do anjo (formato de gota/coração invertido) -->
      <path
        d="M100 88 
           C100 88 84 105 78 120 
           C72 135 76 150 86 158 
           C96 166 100 168 100 168 
           C100 168 104 166 114 158 
           C124 150 128 135 122 120 
           C116 105 100 88 100 88 Z"
        fill="#D90445"
      />

      <!-- Coração vazado branco no centro -->
      <path
        d="M100 128 
           C100 128 92 120 88 116 
           C84 112 82 108 84 104 
           C86 100 90 98 94 100 
           C98 102 100 106 100 106 
           C100 106 102 102 106 100 
           C110 98 114 100 116 104 
           C118 108 116 112 112 116 
           C108 120 100 128 100 128 Z"
        fill="white"
      />

      <!-- Detalhes pretos nos ombros / junção das asas -->
      <path
        d="M82 90 C78 88 74 90 76 94 C78 96 82 94 82 90 Z"
        fill="#1a1a1a"
        opacity="0.8"
      />
      <path
        d="M118 90 C122 88 126 90 124 94 C122 96 118 94 118 90 Z"
        fill="#1a1a1a"
        opacity="0.8"
      />

      <!-- Pequeno destaque no centro superior do corpo -->
      <path
        d="M96 90 C96 90 98 94 100 94 C102 94 104 90 104 90 C102 88 98 88 96 90 Z"
        fill="#B80338"
        opacity="0.5"
      />
    </svg>

    <!-- Texto abaixo -->
    <div class="logo-text" v-if="showText">
      <div class="associacao-label">ASSOCIAÇÃO</div>
      <div class="anjo-label">Anjo da Guarda</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 120 },
  showText: { type: Boolean, default: true }
})
</script>

<style scoped>
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.logo-text {
  margin-top: 8px;
  text-align: center;
}

.associacao-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 2px;
}

.anjo-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.5px;
}
</style>