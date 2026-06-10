# iframe 안 요소 다루기

홈택스·정부24·은행 등 한국 사이트는 실제 컨텐츠가 iframe 안에 있어 `snapshot`에 ref가 안 잡힐 수 있다.

## iframe 내부 버튼/링크 스캔

```bash
playwright-cli -s=<name> eval "(() => {
  const iframe = document.querySelector('iframe');
  const doc = iframe && iframe.contentDocument;
  if (!doc) return 'no iframe doc';
  const els = Array.from(doc.querySelectorAll('button, input[type=button], a'));
  return els.map(b => ({
    tag: b.tagName,
    text: (b.textContent || b.value || '').trim().slice(0, 50),
    href: (b.href || '').slice(0, 80),
    onclick: (b.getAttribute('onclick') || '').slice(0, 80)
  })).filter(b => b.text);
})()"
```

키워드 필터링 (확인/닫기/다음/진행 등):

```bash
playwright-cli -s=<name> eval "(() => {
  const iframe = document.querySelector('iframe');
  const doc = iframe?.contentDocument;
  if (!doc) return 'no doc';
  const els = Array.from(doc.querySelectorAll('button, input[type=button], a'));
  return els
    .map(b => ({ text: (b.textContent || b.value || '').trim(), el: b }))
    .filter(b => /확인|닫기|다음|진행|계속|시작|바로가기|메인/.test(b.text))
    .map(b => b.text);
})()"
```

## iframe 내부 버튼 클릭

ref가 안 잡히면 텍스트로 매치해서 직접 click:

```bash
playwright-cli -s=<name> eval "(() => {
  const iframe = document.querySelector('iframe');
  const doc = iframe?.contentDocument;
  const btn = doc && Array.from(doc.querySelectorAll('input[type=button], button'))
    .find(b => (b.value || b.textContent || '').trim() === '닫기');
  if (!btn) return 'no btn';
  btn.click();
  return 'clicked';
})()"
```

## iframe src 확인 (어떤 페이지인지)

```bash
playwright-cli -s=<name> eval "(() => {
  const iframe = document.querySelector('iframe');
  return { src: iframe?.src, name: iframe?.name, title: iframe?.contentDocument?.title };
})()"
```

src의 쿼리스트링이 "installList=IPINSIDE-NX" 같은 보안프로그램 게이트를 드러낼 수 있다.

## snapshot을 파일로 저장해 grep

ref 많은 페이지는 파일로 저장 후 keyword grep이 빠르다:

```bash
playwright-cli -s=<name> snapshot --filename=current.yml
grep -n "사업자등록\|신청\|확인" .playwright-cli/current.yml | head
```

snapshot 파일 기본 경로: `.playwright-cli/page-<timestamp>.yml` (미지정 시).
