import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 인터넷·별도 배포 없이 파일 하나로 열어볼 수 있는 오프라인 버전을 만들 때 쓰는 설정.
// JS/CSS/이미지를 전부 하나의 index.html 안에 인라인(base64)한다.
// npm run build:standalone 으로 실행한다.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100 * 1024 * 1024,
    cssCodeSplit: false,
    outDir: 'dist-standalone',
  },
})
