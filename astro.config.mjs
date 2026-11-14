// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// GitHub Pages 组织站：仓库 tinycove.github.io → 部署在 https://tinycove.space/ 根路径（自定义域名，tinycove.github.io 由 GitHub Pages 自动 301 跳转）
export default defineConfig({
	site: 'https://tinycove.space',
	base: '/',
});
