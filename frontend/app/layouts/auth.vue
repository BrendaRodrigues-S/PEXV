<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-bg">

    <!-- Animated blobs -->
    <div class="blob blob-1" />
    <div class="blob blob-2" />
    <div class="blob blob-3" />
    <div class="blob blob-4" />

    <!-- Floating dots grid -->
    <div class="dots-grid" />

    <!-- Content -->
    <div class="w-full max-w-md relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-up">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-lg mb-4 logo-pulse">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-surface-900 tracking-tight">
          Creative<span class="text-primary-600">Flow</span>
        </h1>
        <p class="text-surface-500 mt-1.5 text-sm">O segundo cérebro do designer criativo</p>
      </div>

      <!-- Card -->
      <div class="animate-fade-up-delay">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-bg {
  background: #f6f8ed;
}

/* Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.45;
  pointer-events: none;
}

.blob-1 {
  width: 420px;
  height: 420px;
  background: #74c465;
  top: -120px;
  left: -100px;
  animation: float1 9s ease-in-out infinite;
}

.blob-2 {
  width: 360px;
  height: 360px;
  background: #dbe64c;
  bottom: -80px;
  right: -80px;
  animation: float2 11s ease-in-out infinite;
}

.blob-3 {
  width: 280px;
  height: 280px;
  background: #00804d;
  top: 40%;
  right: 5%;
  opacity: 0.2;
  animation: float3 13s ease-in-out infinite;
}

.blob-4 {
  width: 200px;
  height: 200px;
  background: #1e4890;
  bottom: 20%;
  left: 5%;
  opacity: 0.15;
  animation: float2 10s ease-in-out infinite reverse;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, 20px) scale(1.05); }
  66%       { transform: translate(-20px, 30px) scale(0.97); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40%       { transform: translate(-25px, -20px) scale(1.08); }
  70%       { transform: translate(20px, 10px) scale(0.95); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-30px, 25px) scale(1.1); }
}

/* Dots grid */
.dots-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #00804d22 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  opacity: 0.6;
}

/* Logo pulse */
.logo-pulse {
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 128, 77, 0.3), 0 8px 24px rgba(0,0,0,0.12); }
  50%       { box-shadow: 0 0 0 10px rgba(0, 128, 77, 0), 0 8px 24px rgba(0,0,0,0.12); }
}

/* Entry animations */
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-fade-up-delay {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
