import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 프로젝트 사이트는 하위 경로(/저장소이름/)에서 서빙되므로 BASE_PATH로
  // 지정한다. Netlify 등 루트에서 서빙하는 곳은 이 값을 안 주면 기본값 '/'를 쓴다.
  base: process.env.BASE_PATH || '/',
})
