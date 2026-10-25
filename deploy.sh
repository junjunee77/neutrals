#!/bin/bash
# One-click deployment script to GitHub Pages
cd "$(dirname "$0")"

echo "🔄 수정된 파일들을 깃허브로 자동 배포합니다..."
git add .
git commit -m "Update platform: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "✅ 깃허브 웹사이트(GitHub Pages)에 성공적으로 반영되었습니다!"
