# 다운로드 처리

playwright headed 모드에서 브라우저가 파일을 다운로드하면, playwright가 이를 **임시폴더에 UUID 이름으로** 저장한다 (Chrome이 `~/Downloads`로 저장하는 게 아니다).

## 위치 찾기

```bash
ls -la /private/var/folders/**/playwright-artifacts-*/ 2>/dev/null
# 또는 최근 10분내 생성된 파일
find ~/Library/Caches/ms-playwright /private/var/folders -type f -mmin -10 2>/dev/null | head -20
```

파일은 확장자 없이 UUID 형식으로 저장된다.

## 파일 타입 확인

```bash
file /private/var/folders/.../playwright-artifacts-.../UUID
# 예: xar archive → .pkg
# 예: PDF document, version 1.4 → .pdf
# 예: Zip archive → .zip
```

## Downloads로 복사 + rename

```bash
cp /private/var/folders/.../playwright-artifacts-.../<UUID> ~/Downloads/<의미있는이름>.<확장자>
```

## Chrome 내부 다운로드 목록 조회

`chrome://downloads/` 탭을 열어 shadow DOM으로 조회:

```bash
playwright-cli -s=<name> tab-new chrome://downloads/
playwright-cli -s=<name> eval "(() => {
  const m = document.querySelector('downloads-manager');
  const items = m?.shadowRoot?.querySelectorAll('downloads-item');
  if (!items) return 'no items';
  return Array.from(items).slice(0, 5).map(it => {
    const s = it.shadowRoot;
    return {
      name: s?.querySelector('#name')?.textContent?.trim(),
      url: s?.querySelector('#url')?.href,
      status: s?.querySelector('.description')?.textContent?.trim()
    };
  });
})()"
```

원래 탭으로 복귀:
```bash
playwright-cli -s=<name> tab-select 0
```

## macOS 설치 패키지(.pkg)

사용자 동의 없이 `installer` / `open` 으로 자동 실행하지 않는다. 복사 후 Finder에서 더블클릭하도록 안내:

> "`~/Downloads/파일명.pkg` 를 Finder에서 더블클릭 → macOS Installer 마법사 따라가기. 설치 완료 후 Chrome 탭에서 Cmd+R 새로고침하고 알려줘."
