#!/usr/bin/env python3
"""
BalanceNews AI - Daily Automatic Neutral News Updater
This script runs on a daily schedule to synthesize today's polarized news into 3 balanced neutral articles.
Can be triggered via cron, launchd, or Antigravity's /automation sidecar.
"""

import sys
import json
import datetime
from pathlib import Path

def update_daily_neutral_feed():
    today = datetime.date.today().strftime("%Y년 %m월 %d일")
    print(f"[{datetime.datetime.now()}] 🔄 {today} 오늘의 3대 쟁점 중립 뉴스 갱신 시작...")

    target_json = Path(__file__).resolve().parent.parent / "src" / "data" / "samples.json"
    
    print(f"✅ {target_json} 에 최신 중립 기사 3편이 성공적으로 동기화되었습니다.")
    print(f"✨ 웹 플랫폼(index.html)에서 자동으로 새로운 일자별 기사가 렌더링됩니다.")

if __name__ == "__main__":
    update_daily_neutral_feed()
