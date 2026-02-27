# WASM Roguelike (C → WebAssembly) on GitHub Pages

- C로 만든 코어 로직을 WebAssembly로 빌드하여 브라우저에서 실행
- 저장은 IndexedDB 1슬롯(이어하기)
- 배포는 GitHub Actions로 자동

## Controls

- Move: Arrow keys
- Dash: Shift + Arrow (2 tiles)
- Attack: bump into enemies

## Deploy

Push to `main` → Actions builds WASM and publishes `/web` to `gh-pages`.

## Notes

- MVP라서 1층/보스/간단 AI만 포함
- 다음 확장: 층 생성, 아이템, 이벤트/스토리 노드, 보스 패턴 다양화
