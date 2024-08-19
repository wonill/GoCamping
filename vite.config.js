import { defineConfig } from "vite";

export default defineConfig({
  build: {
    assetsInlineLimit: 0, // 모든 이미지를 파일로 처리
  },
});
