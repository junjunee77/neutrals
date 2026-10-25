# Neutral News AI - Node.js Express Backend Service 📰⚖️

좌우 편향된 언론 보도를 교차 검증하고, 외신(로이터, BBC, 구글뉴스) 실시간 RSS 피드를 크롤링하여 팩트 기반의 **5:5 중립 정통 신문 기사**를 생성하는 Node.js 백엔드 서버입니다.

---

## 🚀 빠른 시작 (Quick Start)

### 1. 패키지 설치 및 서버 실행
```bash
cd backend
npm install
npm start
```

> **Zero-Dependency 지원**: `npm install`을 실행하기 전에도 `node server.js` 명령만으로 Node.js 내장 모듈을 통해 즉시 서버가 실행됩니다.

개발 모드로 실행 시(파일 수정 시 자동 재시작):
```bash
npm run dev
```

서버가 정상 실행되면 `http://localhost:4000`에서 API를 이용하실 수 있습니다.

---

## 📡 API 엔드포인트 명세

| 메서드 | 엔드포인트 | 설명 |
|---|---|---|
| `GET` | `/api/health` | 백엔드 서버 상태 및 Uptime 헬스체크 |
| `GET` | `/api/news` | 현재 활성화된 4대 분야 중립 기사 세트 반환 |
| `GET` | `/api/news/crawl` | **실시간 외신 RSS 피드 크롤링 트리거** 및 5:5 중립 신문 기사체 즉시 합성 |
| `GET` | `/api/news/archive` | 서버에 보관된 전체 에디션(총 16개+ 정통 기사) 목록 조회 |
| `POST` | `/api/news/synthesize` | 사용자가 전달한 원문 텍스트를 실시간으로 중립 기사체로 변환 |

### 1. `GET /api/news` 응답 예시
```json
{
  "status": "success",
  "activeEditionIndex": 0,
  "currentEdition": {
    "id": "edition-1",
    "name": "에디션 1 (부동산 대출 규제 · 대서양 방위비 분담 · 북러 군사조약 · 방글라데시 7월 혁명)",
    "articles": [
      {
        "category": "국내",
        "origin": "국내 경제·부동산 종합",
        "headline": "가계부채 1900조 관리냐, 내 집 마련 주거 사다리냐… 주담대·디딤돌 규제 후폭풍",
        "subheadline": "수도권 집값 불안과 가계부채 억제를 위한 금융 조이기에 서민 실수요자 반발 확산",
        "byline": "【서울=경제부 종합】",
        "summaryBullets": [
          "한국 가계부채 총액이 1,900조 원 안팎에 도달하여 GDP 대비 부채비율이 주요국 최상위권을 유지함.",
          "정부와 시중은행이 스트레스 DSR 2단계 및 주담대 한도를 조이고 디딤돌 대출 한도 축소를 추진함.",
          "무주택 실수요자들의 거센 반발로 국토부는 한시적 유예 및 보완책을 발표하며 정책 혼선이 지속됨."
        ],
        "perspectives": {
          "right": {
            "title": "정부 및 금융당국 (거시 안정)",
            "text": "가계부채가 GDP의 90%를 초과하는 상황에서 선제적 총량 관리는 불가피합니다."
          },
          "left": {
            "title": "야당 및 실수요자 (주거 사다리)",
            "text": "서민·신혼부부의 정책대출까지 일방적으로 축소해 사금융으로 내모는 서민 옥죄기입니다."
          }
        },
        "bodyHtml": "<p>수도권 아파트값 불안과 가계부채 급증세를 억제하기 위한 금융당국의 주택담보대출 규제...</p>"
      }
    ]
  },
  "totalEditions": 4,
  "categories": ["국내", "해외", "북한", "이색 해외"]
}
```

### 2. `GET /api/news/crawl` 응답 예시
```json
{
  "status": "success",
  "message": "실시간 외신(로이터, BBC, 구글뉴스) RSS 크롤링 및 5:5 중립 신문 기사체 합성 완료",
  "edition": {
    "id": "live-1729837200000",
    "name": "실시간 속보 에디션 (2026.10.25 15:00 크롤링 갱신)",
    "isLiveCrawled": true,
    "crawledAt": "2026-10-25T06:00:00.000Z",
    "articles": [ ... ]
  }
}
```

---

## ⚙️ 아키텍처 및 4대 카테고리 구성

1. **국내 (Domestic)**: 정부 정책, 금융·부동산, 여야 정치 현안의 거시 안정 vs 민생 지원 쟁점
2. **해외 (International)**: 미국·유럽·아시아 지정학적 동맹, 통상 관세, 방위비 분담금 및 기술 패권
3. **북한 (North Korea)**: 북러 군사동맹, 한미 확장억제, NLL·접경지 대치 및 대북 심리전
4. **이색 해외 (Global Domestic Affairs)**: 국내 언론 사각지대인 방글라데시 7월 혁명, 케냐 Z세대 시위, 조지아 외국의 대행자법 반대 항쟁, 서아프리카 사헬 3국 탈식민 반란 등 제3세계 현지 내정 격변
